"use client";

import { useEffect, useReducer, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  MENU,
  QR_TABLES,
  RESTAURANT_ID,
  KitchenStatus,
  MenuItem,
} from "@/lib/constants";
import type { DbOrder, DbTable, DbMenuItem } from "@/lib/supabase";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  item: MenuItem;
  qty: number;
}

export interface Order {
  id: string;
  status: KitchenStatus;
  etaMinutes: number | null;
  items: CartItem[];
  note: string;
  total: number;
  createdAt: string;
}

export interface WaiterCall {
  pending: boolean;
  reason: string;
  calledAt: string | null;
}

export interface TableContext {
  qrToken: string;
  tableId: number;
  tableLabel: string;
  zone: string;
  sessionId: string;
  restaurantId: string;
}

export interface SessionState {
  tableCtx: TableContext | null;
  menuItems: MenuItem[];
  cart: CartItem[];
  cartNote: string;
  orders: Order[];
  waiterCall: WaiterCall;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: "SET_TABLE_CTX"; ctx: TableContext }
  | { type: "SET_MENU"; items: MenuItem[] }
  | { type: "SET_ERROR"; error: string }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "ADD_ITEM"; item: MenuItem }
  | { type: "REMOVE_ITEM"; itemId: string }
  | { type: "SET_CART_NOTE"; note: string }
  | { type: "CLEAR_CART" }
  | { type: "ADD_ORDER"; order: Order }
  | { type: "UPDATE_ORDER_STATUS"; orderId: string; status: KitchenStatus; etaMinutes: number | null }
  | { type: "SET_WAITER_CALL"; call: WaiterCall };

// ── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "SET_TABLE_CTX":
      return { ...state, tableCtx: action.ctx };
    case "SET_MENU":
      return { ...state, menuItems: action.items };
    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "ADD_ITEM": {
      const existing = state.cart.find((c) => c.item.id === action.item.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((c) =>
            c.item.id === action.item.id ? { ...c, qty: c.qty + 1 } : c
          ),
        };
      }
      return { ...state, cart: [...state.cart, { item: action.item, qty: 1 }] };
    }
    case "REMOVE_ITEM": {
      const existing = state.cart.find((c) => c.item.id === action.itemId);
      if (!existing) return state;
      if (existing.qty === 1) {
        return { ...state, cart: state.cart.filter((c) => c.item.id !== action.itemId) };
      }
      return {
        ...state,
        cart: state.cart.map((c) =>
          c.item.id === action.itemId ? { ...c, qty: c.qty - 1 } : c
        ),
      };
    }
    case "SET_CART_NOTE":
      return { ...state, cartNote: action.note };
    case "CLEAR_CART":
      return { ...state, cart: [], cartNote: "" };
    case "ADD_ORDER":
      return { ...state, orders: [action.order, ...state.orders] };
    case "UPDATE_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId
            ? { ...o, status: action.status, etaMinutes: action.etaMinutes }
            : o
        ),
      };
    case "SET_WAITER_CALL":
      return { ...state, waiterCall: action.call };
    default:
      return state;
  }
}

const initialState: SessionState = {
  tableCtx: null,
  menuItems: MENU,
  cart: [],
  cartNote: "",
  orders: [],
  waiterCall: { pending: false, reason: "", calledAt: null },
  loading: true,
  error: null,
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useTableSession(qrToken: string) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Track realtime channel so we can clean up on unmount
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ── Resolve QR → table context ──────────────────────────────────────────

  useEffect(() => {
    if (!qrToken) {
      dispatch({ type: "SET_ERROR", error: "QR inválido" });
      return;
    }
    resolveQrContext(qrToken).then((ctx) => {
      if (!ctx) {
        dispatch({ type: "SET_ERROR", error: "Mesa no encontrada para este QR" });
        return;
      }
      dispatch({ type: "SET_TABLE_CTX", ctx });
      dispatch({ type: "SET_LOADING", loading: false });
    });
  }, [qrToken]);

  // ── Load menu from Supabase ─────────────────────────────────────────────

  useEffect(() => {
    loadMenu().then((items) => {
      if (items.length > 0) dispatch({ type: "SET_MENU", items });
      // If Supabase returns nothing, we keep the static MENU fallback
    });
  }, []);

  // ── Subscribe to realtime order updates ────────────────────────────────

  useEffect(() => {
    const ctx = state.tableCtx;
    if (!ctx) return;

    const channel = supabase
      .channel(`orders:table_id=eq.${ctx.tableId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `table_id=eq.${ctx.tableId}`,
        },
        (payload) => {
          const row = payload.new as DbOrder;
          if (!row?.id) return;

          if (payload.eventType === "INSERT") {
            // Only add if not already optimistically present
            dispatch({
              type: "ADD_ORDER",
              order: dbOrderToOrder(row),
            });
          } else if (payload.eventType === "UPDATE") {
            dispatch({
              type: "UPDATE_ORDER_STATUS",
              orderId: row.id,
              status: row.status,
              etaMinutes: row.eta_minutes,
            });
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.tableCtx]);

  // ── Actions ─────────────────────────────────────────────────────────────

  const addItem = useCallback((item: MenuItem) => {
    dispatch({ type: "ADD_ITEM", item });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", itemId });
  }, []);

  const setCartNote = useCallback((note: string) => {
    dispatch({ type: "SET_CART_NOTE", note });
  }, []);

  const submitOrder = useCallback(
    async (cart: CartItem[], note: string, tableCtx: TableContext): Promise<{ ok: boolean; error?: string }> => {
      const total = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);

      // Optimistic order so the user sees feedback immediately
      const optimisticOrder: Order = {
        id: `optimistic-${Date.now()}`,
        status: "received",
        etaMinutes: null,
        items: cart,
        note,
        total,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_ORDER", order: optimisticOrder });
      dispatch({ type: "CLEAR_CART" });

      const payload = {
        restaurant_id: tableCtx.restaurantId,
        qr_token: tableCtx.qrToken,
        table_id: tableCtx.tableId,
        session_id: tableCtx.sessionId,
        notes: note || null,
        channel: "QR Mesa",
        priority: "Normal",
        eta_minutes: 18,
        total,
        items: cart.map((c) => ({
          menu_item_id: c.item.id,
          dish_name: c.item.name,
          unit_price: c.item.price,
          qty: c.qty,
        })),
      };

      try {
        const res = await fetch("/api/webhook/order-create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text();
          return { ok: false, error: text || "Error al enviar el pedido" };
        }
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Error de red" };
      }
    },
    []
  );

  const callWaiter = useCallback(
    async (reason: string, tableCtx: TableContext): Promise<{ ok: boolean; error?: string }> => {
      dispatch({
        type: "SET_WAITER_CALL",
        call: { pending: true, reason, calledAt: new Date().toISOString() },
      });

      const payload = {
        restaurant_id: tableCtx.restaurantId,
        qr_token: tableCtx.qrToken,
        table_id: tableCtx.tableId,
        session_id: tableCtx.sessionId,
        call_type: reason,
        message: reason,
        priority: reason.toLowerCase().includes("urgente") ? "Alta" : "Normal",
      };

      try {
        const res = await fetch("/api/webhook/camarero-call", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          dispatch({
            type: "SET_WAITER_CALL",
            call: { pending: false, reason: "", calledAt: null },
          });
          return { ok: false, error: "Error al llamar al camarero" };
        }
        // Auto-dismiss after 30 s so they can call again
        setTimeout(() => {
          dispatch({
            type: "SET_WAITER_CALL",
            call: { pending: false, reason: "", calledAt: null },
          });
        }, 30_000);
        return { ok: true };
      } catch (err) {
        dispatch({
          type: "SET_WAITER_CALL",
          call: { pending: false, reason: "", calledAt: null },
        });
        return { ok: false, error: err instanceof Error ? err.message : "Error de red" };
      }
    },
    []
  );

  const requestBill = useCallback(
    async (amount: number, tableCtx: TableContext): Promise<{ ok: boolean; error?: string }> => {
      const payload = {
        restaurant_id: tableCtx.restaurantId,
        qr_token: tableCtx.qrToken,
        table_id: tableCtx.tableId,
        session_id: tableCtx.sessionId,
        amount,
      };

      try {
        const res = await fetch("/api/webhook/bill-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return res.ok ? { ok: true } : { ok: false, error: "Error al solicitar la cuenta" };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Error de red" };
      }
    },
    []
  );

  const sendFeedback = useCallback(
    async (
      rating: number,
      comment: string,
      tableCtx: TableContext
    ): Promise<{ ok: boolean; error?: string }> => {
      const payload = {
        restaurant_id: tableCtx.restaurantId,
        qr_token: tableCtx.qrToken,
        table_id: tableCtx.tableId,
        session_id: tableCtx.sessionId,
        rating,
        comment: comment || null,
        source: "table_qr",
      };

      try {
        const res = await fetch("/api/webhook/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return res.ok ? { ok: true } : { ok: false, error: "Error al enviar feedback" };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Error de red" };
      }
    },
    []
  );

  return {
    ...state,
    addItem,
    removeItem,
    setCartNote,
    submitOrder,
    callWaiter,
    requestBill,
    sendFeedback,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildSessionId(restaurantId: string, qrToken: string, tableId: number): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${restaurantId}-${qrToken}-table-${tableId}-${today}`;
}

async function resolveQrContext(qrToken: string): Promise<TableContext | null> {
  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from("tables")
      .select("id, restaurant_id, label, zone, qr_token, active")
      .eq("qr_token", qrToken)
      .eq("active", true)
      .single();

    if (!error && data) {
      const row = data as DbTable;
      return {
        qrToken,
        tableId: row.id,
        tableLabel: row.label,
        zone: row.zone,
        sessionId: buildSessionId(row.restaurant_id, qrToken, row.id),
        restaurantId: row.restaurant_id,
      };
    }
  } catch {
    // Supabase unavailable — fall through to static lookup
  }

  const fallback = QR_TABLES[qrToken];
  if (!fallback) return null;
  return {
    qrToken,
    tableId: fallback.tableId,
    tableLabel: fallback.tableLabel,
    zone: fallback.zone,
    sessionId: buildSessionId(RESTAURANT_ID, qrToken, fallback.tableId),
    restaurantId: RESTAURANT_ID,
  };
}

async function loadMenu(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", RESTAURANT_ID)
      .eq("available", true)
      .eq("visible_client", true)
      .order("category");

    if (error || !data) return [];

    return (data as DbMenuItem[]).map((row) => ({
      id: row.id,
      name: row.name,
      subtitle: row.subtitle ?? "",
      description: row.description ?? "",
      category: row.category,
      price: row.price,
      avgPrepMinutes: row.avg_prep_minutes ?? 15,
      kcal: row.kcal ?? 0,
      tags: row.tags ?? [],
      allergens: row.allergens ?? [],
      winePair: row.wine_pair ?? undefined,
      imageUrl: row.image_url ?? undefined,
      stockStatus: (row.stock_status as MenuItem["stockStatus"]) ?? "available",
    }));
  } catch {
    return [];
  }
}

function dbOrderToOrder(row: DbOrder): Order {
  return {
    id: row.id,
    status: row.status,
    etaMinutes: row.eta_minutes,
    items: [],
    note: row.notes ?? "",
    total: row.total,
    createdAt: row.created_at,
  };
}
