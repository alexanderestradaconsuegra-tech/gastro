"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isSupabaseConfigured, sbSelect, supabase } from "@/lib/supabase";
import {
  Call,
  CashSession,
  Expense,
  INITIAL_CASH_SESSION,
  InventoryItem,
  MenuItem,
  Message,
  Order,
  OrderItem,
  OrderStatus,
  Review,
  StaffMember,
  Table,
} from "@/lib/constants";

export type QrToken = { tableId: number; token: string; active: boolean };

export interface BackofficeState {
  orders: Order[];
  calls: Call[];
  messages: Message[];
  tables: Table[];
  staff: StaffMember[];
  cashSession: CashSession;
  inventory: InventoryItem[];
  menuItems: MenuItem[];
  expenses: Expense[];
  reviews: Review[];
  qrTokens: QrToken[];
  demoMode: boolean;
  dbStatus: "ok" | "error" | "loading";
  dbError: string | null;
  lastSync: Date | null;
  setDemoMode: (v: boolean) => void;
  refreshNow: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  closeTable: (tableId: number, paymentMethod: "cash" | "card" | "transfer", amount: number, tipAmount: number) => void;
  attendCall: (callId: string) => void;
  resolveCall: (callId: string) => void;
  resolveMessage: (msgId: number) => void;
  assignWaiter: (tableId: number, waiterId: string) => void;
  setTableTip: (tableId: number, accepted: boolean, suggestedAmount: number) => void;
  saveMenuItem: (item: MenuItem) => void;
  toggleMenuAvailability: (itemId: string) => void;
  deleteMenuItem: (itemId: string) => void;
  openCash: (userId: string) => void;
  closeCash: () => void;
  changeTurn: (turn: string) => void;
  addExpense: (type: string, detail: string, amount: number) => void;
  updateInventoryStock: (itemId: string, qty: number) => void;
  toggleQr: (tableId: number) => void;
  regenerateQr: (tableId: number) => void;
  saveStaffAvatar: (staffId: string, url: string) => void;
}

function randomToken() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ─── mappers ────────────────────────────────────────────────────────────────

function mapDbOrderItem(r: Record<string, unknown>): OrderItem {
  const statusMap: Record<string, string> = {
    pending: "Pendiente",
    prep: "Preparando",
    ready: "Listo",
    served: "Servido",
  };
  return {
    dish: (r.dish_name as string) ?? "",
    qty: (r.qty as number) ?? 1,
    status: statusMap[r.status as string] ?? (r.status as string) ?? "Pendiente",
    price: (r.unit_price as number) ?? 0,
  };
}

function mapDbOrder(r: Record<string, unknown>): Order {
  return {
    id: r.id as string,
    tableId: r.table_id as number,
    waiterId: (r.waiter_id as string) ?? "",
    status: r.status as OrderStatus,
    priority: (r.priority as string) ?? "Normal",
    eta: (r.eta_minutes as number) ?? 0,
    channel: (r.channel as string) ?? "QR Mesa",
    items: [],
    notes: (r.notes as string) ?? "",
    total: (r.total as number) ?? 0,
  };
}

function mapDbCall(r: Record<string, unknown>): Call {
  return {
    id: r.id as string,
    source: (r.source as string) ?? "mesa",
    tableId: r.table_id as number,
    waiterId: (r.waiter_id as string) ?? "",
    type: (r.call_type as string) ?? "",
    priority: (r.priority as string) ?? "Normal",
    status: r.status as Call["status"],
    message: (r.message as string) ?? "",
    createdAt: new Date(r.created_at as string).getTime(),
  };
}

function mapDbMessage(r: Record<string, unknown>): Message {
  return {
    id: r.id as number,
    tableId: r.table_id as number,
    sessionId: (r.session_id as string) ?? "",
    fromRole: (r.from_role as string) ?? "Cliente",
    text: (r.text as string) ?? "",
    status: (r.status as string) ?? "pendiente",
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

function mapDbTable(r: Record<string, unknown>): Table {
  return {
    id: r.id as number,
    zone: (r.zone as string) ?? "",
    status: (r.status as Table["status"]) ?? "Libre",
    guests: (r.guests as number) ?? 0,
    waiterId: (r.waiter_id as string) ?? null,
    bill: (r.bill_total as number) ?? 0,
    qrToken: (r.qr_token as string) ?? "",
  };
}

function mapDbStaff(r: Record<string, unknown>): StaffMember {
  return {
    id: r.id as string,
    name: (r.name as string) ?? "",
    role: r.role as StaffMember["role"],
    shift: (r.shift as string) ?? "",
    status: (r.status as string) ?? "Activo",
    tables: [],
    phone: (r.phone as string) ?? "",
    email: (r.email as string) ?? "",
    avatarUrl: (r.avatar_url as string) ?? undefined,
  };
}

function mapDbMenuItem(r: Record<string, unknown>): MenuItem {
  return {
    id: r.id as string,
    name: r.name as string,
    subtitle: (r.subtitle as string) ?? "",
    description: (r.description as string) ?? "",
    category: r.category as string,
    price: r.price as number,
    avgPrepMinutes: (r.avg_prep_minutes as number) ?? 15,
    kcal: (r.kcal as number) ?? 0,
    tags: (r.tags as string[]) ?? [],
    allergens: (r.allergens as string[]) ?? [],
    available: (r.available as boolean) ?? true,
    visibleClient: (r.visible_client as boolean) ?? true,
    stockStatus: (r.stock_status as MenuItem["stockStatus"]) ?? "ok",
    winePair: (r.wine_pair as string) ?? undefined,
    imageUrl: (r.image_url as string) ?? undefined,
  };
}

function mapDbReview(r: Record<string, unknown>): Review {
  return {
    id: String(r.id),
    tableId: (r.table_id as number) ?? 0,
    waiterId: (r.waiter_id as string) ?? "",
    rating: r.rating as number,
    comment: (r.comment as string) ?? "",
    source: (r.source as string) ?? "table_qr",
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}

function mapDbInventory(r: Record<string, unknown>): InventoryItem {
  return {
    id: r.id as string,
    name: (r.name as string) ?? "",
    category: (r.category as string) ?? "",
    stock: Number(r.stock ?? 0),
    minStock: Number(r.min_stock ?? 0),
    unit: (r.unit as string) ?? "kg",
    linkedDishes: (r.linked_dishes as string[]) ?? [],
  };
}

// ─── hook ───────────────────────────────────────────────────────────────────

export function useBackofficeState(): BackofficeState {
  const [orders, setOrders] = useState<Order[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [cashSession, setCashSession] = useState<CashSession>(INITIAL_CASH_SESSION);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [qrTokens, setQrTokens] = useState<QrToken[]>([]);
  const [dbStatus, setDbStatus] = useState<"ok" | "error" | "loading">("loading");
  const [dbError, setDbError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  // Refs for each poller so refreshNow can trigger all three
  const refreshOrdersRef = useRef<(() => void) | null>(null);
  const refreshTablesRef = useRef<(() => void) | null>(null);
  const refreshCallsRef = useRef<(() => void) | null>(null);

  const supabaseAvailable = useRef(isSupabaseConfigured());

  // ─── unified poller: orders + items + tables + calls (every 5 s) ─────────
  useEffect(() => {
    console.log("[gastro] useBackofficeState mount — supabaseAvailable:", supabaseAvailable.current);
    if (!supabaseAvailable.current) {
      setDbStatus("error");
      setDbError("Supabase no configurado");
      return;
    }

    let cancelled = false;

    async function refreshAll() {
      const t0 = Date.now();
      console.log("[gastro] refreshAll start");
      try {
        const [ordersData, tablesData, callsData] = await Promise.all([
          sbSelect("orders", "select=*&order=created_at.desc&limit=200"),
          sbSelect("tables", "select=*&order=id"),
          sbSelect("calls", "select=*&order=created_at.desc&limit=100"),
        ]);

        const dt = Date.now() - t0;
        console.log(`[gastro] refreshAll resolved in ${dt}ms — orders=${ordersData.length} tables=${tablesData.length} calls=${callsData.length} cancelled=${cancelled}`);

        if (cancelled) return;

        const ids = ordersData.map((o) => o.id as string);
        const itemsData = ids.length
          ? await sbSelect("order_items", `select=*&order_id=in.(${ids.join(",")})`)
          : [];

        if (cancelled) return;

        const byOrder: Record<string, Record<string, unknown>[]> = {};
        for (const item of itemsData as Record<string, unknown>[]) {
          const oid = item.order_id as string;
          if (!byOrder[oid]) byOrder[oid] = [];
          byOrder[oid].push(item);
        }

        const mappedOrders = (ordersData as Record<string, unknown>[]).map((o) => ({
          ...mapDbOrder(o),
          items: (byOrder[o.id as string] ?? []).map(mapDbOrderItem),
        }));

        const byStatus = mappedOrders.reduce((acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc; }, {} as Record<string, number>);
        console.log(`[gastro] fetched ${mappedOrders.length} orders (${JSON.stringify(byStatus)}), ${tablesData.length} tables, ${callsData.length} calls`);

        setOrders(mappedOrders);

        if (tablesData.length) {
          setTables((tablesData as Record<string, unknown>[]).map(mapDbTable));
          setQrTokens((tablesData as Record<string, unknown>[]).map((r) => ({
            tableId: r.id as number,
            token: r.qr_token as string,
            active: r.active as boolean,
          })));
        }

        if (callsData.length) {
          setCalls((callsData as Record<string, unknown>[]).map(mapDbCall));
        }

        setDbStatus("ok");
        setDbError(null);
        setLastSync(new Date());
      } catch (err) {
        console.error("[gastro] refreshAll exception:", err);
        if (!cancelled) {
          setDbStatus("error");
          setDbError(err instanceof Error ? err.message : String(err));
        }
      }
    }

    refreshOrdersRef.current = refreshAll;
    refreshTablesRef.current = refreshAll;
    refreshCallsRef.current = refreshAll;

    refreshAll();
    const interval = setInterval(refreshAll, 3_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // ─── load open cash session on mount ────────────────────────────────────
  useEffect(() => {
    if (!supabaseAvailable.current) return;
    sbSelect("cash_sessions", "select=*&status=eq.open&order=opened_at.desc&limit=1")
      .then((rows) => {
        const data = rows[0] as Record<string, unknown> | undefined;
        if (!data) return;
        setCashSession({
          id: data.id as string,
          status: "abierta",
          openedAt: new Date(data.opened_at as string).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
          turn: (data.turn as string) ?? "Noche",
          openedBy: (data.opened_by as string) ?? "",
          openingCash: (data.opening_cash as number) ?? 0,
          cash: (data.cash_total as number) ?? 0,
          card: (data.card_total as number) ?? 0,
          transfer: (data.transfer_total as number) ?? 0,
          tips: (data.tips_total as number) ?? 0,
          expenses: (data.expenses_total as number) ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  // ─── one-time loads (less time-sensitive) ────────────────────────────────
  useEffect(() => {
    if (!supabaseAvailable.current) return;

    sbSelect("messages", "select=*&order=created_at.desc&limit=100")
      .then((data) => { if (data.length) setMessages((data as Record<string, unknown>[]).map(mapDbMessage)); })
      .catch(() => {});

    sbSelect("staff", "select=*&order=name")
      .then((data) => { if (data.length) setStaff((data as Record<string, unknown>[]).map(mapDbStaff)); })
      .catch(() => {});

    sbSelect("menu_items", "select=*&order=category")
      .then((data) => { if (data.length) setMenuItems((data as Record<string, unknown>[]).map(mapDbMenuItem)); })
      .catch(() => {});

    sbSelect("reviews", "select=*&order=created_at.desc&limit=50")
      .then((data) => { if (data.length) setReviews((data as Record<string, unknown>[]).map(mapDbReview)); })
      .catch(() => {});

    sbSelect("inventory", "select=*&order=name")
      .then((data) => { if (data.length) setInventory((data as Record<string, unknown>[]).map(mapDbInventory)); })
      .catch(() => {});
  }, []);

  // ─── realtime (instant supplements to polling) ───────────────────────────
  useEffect(() => {
    if (!supabaseAvailable.current) return;

    // Orders — instant status updates from admin actions
    const ordersChannel = supabase
      .channel("orders-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, async (payload) => {
        const r = payload.new as Record<string, unknown>;
        // Fetch items for the new order — they may have inserted just before or after
        const { data: items } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", r.id as string);
        setOrders((prev) => {
          if (prev.find((o) => o.id === r.id)) return prev;
          return [{ ...mapDbOrder(r), items: (items ?? []).map(mapDbOrderItem) }, ...prev];
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        const r = payload.new as Record<string, unknown>;
        setOrders((prev) =>
          prev.map((o) =>
            o.id === r.id
              ? { ...o, status: r.status as OrderStatus, total: (r.total as number) ?? o.total }
              : o
          )
        );
      })
      .subscribe();

    // Calls — instant notifications when mesa calls
    const callsChannel = supabase
      .channel("calls-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "calls" }, (payload) => {
        const r = payload.new as Record<string, unknown>;
        setCalls((prev) => {
          if (prev.find((c) => c.id === r.id)) return prev;
          return [mapDbCall(r), ...prev];
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "calls" }, (payload) => {
        const r = payload.new as Record<string, unknown>;
        setCalls((prev) =>
          prev.map((c) => (c.id === r.id ? { ...c, status: r.status as Call["status"] } : c))
        );
      })
      .subscribe();

    // Messages — instant chat
    const messagesChannel = supabase
      .channel("messages-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const r = payload.new as Record<string, unknown>;
        setMessages((prev) => {
          if (prev.find((m) => m.id === r.id)) return prev;
          return [...prev, mapDbMessage(r)];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(callsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, []);

  // ─── actions ─────────────────────────────────────────────────────────────

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    if (!supabaseAvailable.current) return;
    await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
  }, []);

  const attendCall = useCallback((callId: string) => {
    setCalls((prev) => prev.map((c) => (c.id === callId ? { ...c, status: "En atención" } : c)));
    if (!supabaseAvailable.current) return;
    supabase.from("calls").update({ status: "En atención" }).eq("id", callId);
  }, []);

  const resolveCall = useCallback((callId: string) => {
    setCalls((prev) => prev.map((c) => (c.id === callId ? { ...c, status: "Resuelto" } : c)));
    if (!supabaseAvailable.current) return;
    supabase.from("calls").update({ status: "Resuelto", resolved_at: new Date().toISOString() }).eq("id", callId);
  }, []);

  const resolveMessage = useCallback((msgId: number) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, status: "resuelto" } : m)));
    if (!supabaseAvailable.current) return;
    supabase.from("messages").update({ status: "resuelto" }).eq("id", msgId);
  }, []);

  const assignWaiter = useCallback((tableId: number, waiterId: string) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, waiterId } : t)));
    if (!supabaseAvailable.current) return;
    supabase.from("tables").update({ waiter_id: waiterId }).eq("id", tableId);
  }, []);

  const setTableTip = useCallback((tableId: number, accepted: boolean, suggestedAmount: number) => {
    const tipAmount = accepted ? suggestedAmount : 0;
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, tipAccepted: accepted, tipAmount } : t))
    );
    if (!supabaseAvailable.current) return;
    supabase.from("tables").update({ tip_accepted: accepted, tip_amount: tipAmount }).eq("id", tableId);
  }, []);

  const closeTable = useCallback((tableId: number, paymentMethod: "cash" | "card" | "transfer", amount: number, tipAmount: number) => {
    // Optimistic UI — instant, never blocks
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, status: "Libre" as Table["status"], bill: 0, guests: 0, waiterId: null } : t
      )
    );
    setOrders((prev) =>
      prev.map((o) =>
        o.tableId === tableId && ["received", "prep", "plating"].includes(o.status)
          ? { ...o, status: "served" as OrderStatus }
          : o
      )
    );
    setCashSession((prev) => ({
      ...prev,
      [paymentMethod]: prev[paymentMethod] + amount,
      tips: prev.tips + tipAmount,
    }));

    if (!supabaseAvailable.current) return;

    // Fire-and-forget DB writes — UI already updated above
    const colMap: Record<string, string> = { cash: "cash_total", card: "card_total", transfer: "transfer_total" };
    const amountCol = colMap[paymentMethod];

    supabase
      .from("orders")
      .update({ status: "served", updated_at: new Date().toISOString() })
      .eq("table_id", tableId)
      .in("status", ["received", "prep", "plating"])
      .then(() => {});

    supabase
      .from("tables")
      .update({ status: "Libre", bill_total: 0, guests: 0, waiter_id: null, tip_accepted: false, tip_amount: 0 })
      .eq("id", tableId)
      .then(() => {});

    // Atomically increment the open cash session totals via RPC to avoid lost-update races
    supabase.rpc("increment_cash_session", {
      p_amount_col: amountCol,
      p_amount: amount,
      p_tips: tipAmount,
    }).then(() => {});
  }, []);

  const saveMenuItem = useCallback((item: MenuItem) => {
    setMenuItems((prev) => {
      const exists = prev.find((m) => m.id === item.id);
      return exists ? prev.map((m) => (m.id === item.id ? item : m)) : [...prev, item];
    });
    if (!supabaseAvailable.current) return;
    supabase.from("menu_items").upsert({
      id: item.id,
      name: item.name,
      subtitle: item.subtitle,
      description: item.description,
      category: item.category,
      price: item.price,
      avg_prep_minutes: item.avgPrepMinutes,
      kcal: item.kcal,
      tags: item.tags,
      allergens: item.allergens,
      wine_pair: item.winePair,
      image_url: item.imageUrl,
      stock_status: item.stockStatus,
      available: item.available,
      visible_client: item.visibleClient,
    });
  }, []);

  const toggleMenuAvailability = useCallback((itemId: string) => {
    let nextAvailable = true;
    setMenuItems((prev) =>
      prev.map((m) => {
        if (m.id === itemId) {
          nextAvailable = !m.available;
          return { ...m, available: nextAvailable };
        }
        return m;
      })
    );
    if (!supabaseAvailable.current) return;
    supabase.from("menu_items").update({ available: nextAvailable }).eq("id", itemId);
  }, []);

  const deleteMenuItem = useCallback((itemId: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== itemId));
    if (!supabaseAvailable.current) return;
    supabase.from("menu_items").delete().eq("id", itemId);
  }, []);

  const openCash = useCallback((userId: string) => {
    const now = new Date();
    const id = `SHIFT-${now.toISOString().split("T")[0]}-${Date.now()}`;
    setCashSession({
      id,
      status: "abierta",
      openedAt: now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
      turn: "Noche",
      openedBy: userId,
      openingCash: 150000,
      cash: 0,
      card: 0,
      transfer: 0,
      tips: 0,
      expenses: 0,
    });
    if (!supabaseAvailable.current) return;
    supabase.from("cash_sessions").insert({
      id,
      restaurant_id: "nido",
      opened_by: null,
      turn: "Noche",
      status: "open",
      opening_cash: 150000,
    }).then(() => {});
  }, []);

  const closeCash = useCallback(() => {
    let sessionId = "";
    setCashSession((prev) => { sessionId = prev.id; return { ...prev, status: "cerrada" }; });
    if (!supabaseAvailable.current) return;
    // Use functional update to capture current id synchronously above
    setTimeout(() => {
      if (sessionId) {
        supabase.from("cash_sessions")
          .update({ status: "closed", closed_at: new Date().toISOString() })
          .eq("id", sessionId)
          .then(() => {});
      }
    }, 0);
  }, []);

  const changeTurn = useCallback((turn: string) => {
    setCashSession((prev) => ({ ...prev, turn }));
  }, []);

  const addExpense = useCallback((type: string, detail: string, amount: number) => {
    setExpenses((prev) => [...prev, { id: `exp-${Date.now()}`, type, detail, amount, createdAt: Date.now() }]);
    setCashSession((prev) => ({ ...prev, expenses: prev.expenses + amount }));
  }, []);

  const updateInventoryStock = useCallback((itemId: string, qty: number) => {
    let newStock = 0;
    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          newStock = Math.max(0, i.stock + qty);
          return { ...i, stock: newStock };
        }
        return i;
      })
    );
    if (!supabaseAvailable.current) return;
    supabase.from("inventory").update({ stock: newStock }).eq("id", itemId);
  }, []);

  const toggleQr = useCallback((tableId: number) => {
    setQrTokens((prev) =>
      prev.map((q) => (q.tableId === tableId ? { ...q, active: !q.active } : q))
    );
  }, []);

  const regenerateQr = useCallback((tableId: number) => {
    const token = randomToken();
    setQrTokens((prev) => prev.map((q) => (q.tableId === tableId ? { ...q, token, active: true } : q)));
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, qrToken: token } : t)));
    if (!supabaseAvailable.current) return;
    supabase.from("tables").update({ qr_token: token }).eq("id", tableId);
  }, []);

  const saveStaffAvatar = useCallback((staffId: string, url: string) => {
    setStaff((prev) => prev.map((s) => (s.id === staffId ? { ...s, avatarUrl: url } : s)));
    if (!supabaseAvailable.current) return;
    supabase.from("staff").update({ avatar_url: url }).eq("id", staffId);
  }, []);

  const refreshNow = useCallback(() => {
    refreshOrdersRef.current?.();
    refreshTablesRef.current?.();
    refreshCallsRef.current?.();
  }, []);

  return {
    orders,
    calls,
    messages,
    tables,
    staff,
    cashSession,
    inventory,
    menuItems,
    expenses,
    reviews,
    qrTokens,
    demoMode,
    dbStatus,
    dbError,
    lastSync,
    setDemoMode,
    refreshNow,
    updateOrderStatus,
    closeTable,
    attendCall,
    resolveCall,
    resolveMessage,
    assignWaiter,
    setTableTip,
    saveMenuItem,
    toggleMenuAvailability,
    deleteMenuItem,
    openCash,
    closeCash,
    changeTurn,
    addExpense,
    updateInventoryStock,
    saveStaffAvatar,
    toggleQr,
    regenerateQr,
  };
}
