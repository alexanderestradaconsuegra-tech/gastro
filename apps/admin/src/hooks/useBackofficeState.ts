"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Call,
  CashSession,
  Expense,
  INITIAL_CALLS,
  INITIAL_CASH_SESSION,
  INITIAL_INVENTORY,
  INITIAL_MENU_ITEMS,
  INITIAL_MESSAGES,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_STAFF,
  INITIAL_TABLES,
  InventoryItem,
  MenuItem,
  Message,
  Order,
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
  setDemoMode: (v: boolean) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  closeTable: (tableId: number, paymentMethod: "cash" | "card" | "transfer", amount: number, tipAmount: number) => Promise<void>;
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

export function useBackofficeState(): BackofficeState {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [calls, setCalls] = useState<Call[]>(INITIAL_CALLS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [cashSession, setCashSession] = useState<CashSession>(INITIAL_CASH_SESSION);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [demoMode, setDemoMode] = useState(true);
  const [qrTokens, setQrTokens] = useState<QrToken[]>(
    INITIAL_TABLES.map((t) => ({ tableId: t.id, token: t.qrToken, active: true }))
  );

  const supabaseAvailable = useRef(
    !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );

  // Load existing data from Supabase on mount
  useEffect(() => {
    if (!supabaseAvailable.current) return;

    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => { if (data?.length) setOrders(data.map(mapDbOrder)); });

    supabase.from("calls").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => { if (data?.length) setCalls(data.map(mapDbCall)); });

    supabase.from("tables").select("*").order("id")
      .then(({ data }) => {
        if (data?.length) {
          setTables((prev) => prev.map((t) => {
            const r = data.find((d) => d.id === t.id);
            if (!r) return t;
            return {
              ...t,
              status: (r.status as Table["status"]) ?? t.status,
              guests: (r.guests as number) ?? t.guests,
              bill: (r.bill as number) ?? t.bill,
              waiterId: (r.waiter_id as string) ?? t.waiterId,
              qrToken: (r.qr_token as string) ?? t.qrToken,
            };
          }));
        }
      });
  }, []);

  useEffect(() => {
    if (!supabaseAvailable.current) return;

    const ordersChannel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const r = payload.new as Record<string, unknown>;
          setOrders((prev) => [mapDbOrder(r), ...prev]);
        } else if (payload.eventType === "UPDATE") {
          const r = payload.new as Record<string, unknown>;
          setOrders((prev) =>
            prev.map((o) => (o.id === r.id ? { ...o, status: r.status as OrderStatus } : o))
          );
        } else if (payload.eventType === "DELETE") {
          const r = payload.old as Record<string, unknown>;
          setOrders((prev) => prev.filter((o) => o.id !== r.id));
        }
      })
      .subscribe();

    const callsChannel = supabase
      .channel("calls-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "calls" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const r = payload.new as Record<string, unknown>;
          setCalls((prev) => [mapDbCall(r), ...prev]);
        } else if (payload.eventType === "UPDATE") {
          const r = payload.new as Record<string, unknown>;
          setCalls((prev) =>
            prev.map((c) =>
              c.id === r.id ? { ...c, status: r.status as Call["status"] } : c
            )
          );
        }
      })
      .subscribe();

    const messagesChannel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const r = payload.new as Record<string, unknown>;
          setMessages((prev) => [...prev, mapDbMessage(r)]);
        } else if (payload.eventType === "UPDATE") {
          const r = payload.new as Record<string, unknown>;
          setMessages((prev) =>
            prev.map((m) => (m.id === r.id ? { ...m, status: r.status as string } : m))
          );
        }
      })
      .subscribe();

    const tablesChannel = supabase
      .channel("tables-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tables" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          const r = payload.new as Record<string, unknown>;
          setTables((prev) =>
            prev.map((t) =>
              t.id === r.id
                ? {
                    ...t,
                    status: (r.status as Table["status"]) ?? t.status,
                    guests: (r.guests as number) ?? t.guests,
                    bill: (r.bill as number) ?? t.bill,
                  }
                : t
            )
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(callsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(tablesChannel);
    };
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      if (!supabaseAvailable.current) return;
      await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
    },
    []
  );

  const attendCall = useCallback((callId: string) => {
    setCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: "En atención" } : c))
    );
    if (!supabaseAvailable.current) return;
    supabase.from("calls").update({ status: "En atención" }).eq("id", callId);
  }, []);

  const resolveCall = useCallback((callId: string) => {
    setCalls((prev) =>
      prev.map((c) =>
        c.id === callId
          ? { ...c, status: "Resuelto" }
          : c
      )
    );
    if (!supabaseAvailable.current) return;
    supabase
      .from("calls")
      .update({ status: "Resuelto", resolved_at: new Date().toISOString() })
      .eq("id", callId);
  }, []);

  const resolveMessage = useCallback((msgId: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, status: "read" } : m))
    );
    if (!supabaseAvailable.current) return;
    supabase.from("messages").update({ status: "read" }).eq("id", msgId);
  }, []);

  const assignWaiter = useCallback((tableId: number, waiterId: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, waiterId } : t))
    );
    if (!supabaseAvailable.current) return;
    supabase.from("tables").update({ waiter_id: waiterId }).eq("id", tableId);
  }, []);

  const setTableTip = useCallback((tableId: number, accepted: boolean, suggestedAmount: number) => {
    const tipAmount = accepted ? suggestedAmount : 0;
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, tipAccepted: accepted, tipAmount } : t
      )
    );
    if (!supabaseAvailable.current) return;
    supabase.from("tables").update({ tip_accepted: accepted, tip_amount: tipAmount }).eq("id", tableId);
  }, []);

  const closeTable = useCallback(async (tableId: number, paymentMethod: "cash" | "card" | "transfer", amount: number, tipAmount: number) => {
    // Optimistic update
    setTables((prev) => prev.map((t) =>
      t.id === tableId ? { ...t, status: "Libre" as Table["status"], bill: 0, guests: 0, waiterId: null, tipAccepted: false } : t
    ));
    setOrders((prev) => prev.map((o) =>
      o.tableId === tableId && ["received", "prep", "plating"].includes(o.status)
        ? { ...o, status: "served" as OrderStatus }
        : o
    ));
    // Update cash session totals locally
    setCashSession((prev) => ({
      ...prev,
      [paymentMethod]: prev[paymentMethod] + amount,
      tips: prev.tips + tipAmount,
    }));

    if (!supabaseAvailable.current) return;

    await supabase.from("orders")
      .update({ status: "served", updated_at: new Date().toISOString() })
      .eq("table_id", tableId)
      .in("status", ["received", "prep", "plating"]);

    await supabase.from("tables")
      .update({ status: "Libre", bill: 0, guests: 0, waiter_id: null, tip_accepted: false, tip_amount: 0 })
      .eq("id", tableId);
  }, []);

  const saveMenuItem = useCallback((item: MenuItem) => {
    setMenuItems((prev) => {
      const exists = prev.find((m) => m.id === item.id);
      if (exists) return prev.map((m) => (m.id === item.id ? item : m));
      return [...prev, item];
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
    setMenuItems((prev) =>
      prev.map((m) => (m.id === itemId ? { ...m, available: !m.available } : m))
    );
    if (!supabaseAvailable.current) return;
    setMenuItems((prev) => {
      const item = prev.find((m) => m.id === itemId);
      if (item) {
        supabase.from("menu_items").update({ available: item.available }).eq("id", itemId);
      }
      return prev;
    });
  }, []);

  const deleteMenuItem = useCallback((itemId: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== itemId));
    if (!supabaseAvailable.current) return;
    supabase.from("menu_items").delete().eq("id", itemId);
  }, []);

  const openCash = useCallback((userId: string) => {
    const now = new Date();
    const session: CashSession = {
      id: `SHIFT-${now.toISOString().split("T")[0]}-${Date.now()}`,
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
    };
    setCashSession(session);
  }, []);

  const closeCash = useCallback(() => {
    setCashSession((prev) => ({ ...prev, status: "cerrada" }));
    if (!supabaseAvailable.current) return;
    supabase
      .from("cash_sessions")
      .update({ status: "cerrada", closed_at: new Date().toISOString() })
      .eq("id", cashSession.id);
  }, [cashSession.id]);

  const changeTurn = useCallback((turn: string) => {
    setCashSession((prev) => ({ ...prev, turn }));
  }, []);

  const addExpense = useCallback((type: string, detail: string, amount: number) => {
    const expense: Expense = {
      id: `exp-${Date.now()}`,
      type,
      detail,
      amount,
      createdAt: Date.now(),
    };
    setExpenses((prev) => [...prev, expense]);
    setCashSession((prev) => ({ ...prev, expenses: prev.expenses + amount }));
  }, []);

  const updateInventoryStock = useCallback((itemId: string, qty: number) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, stock: Math.max(0, i.stock + qty) } : i))
    );
    if (!supabaseAvailable.current) return;
    setInventory((prev) => {
      const item = prev.find((i) => i.id === itemId);
      if (item) {
        supabase.from("inventory").update({ stock: item.stock }).eq("id", itemId);
      }
      return prev;
    });
  }, []);

  const toggleQr = useCallback((tableId: number) => {
    setQrTokens((prev) =>
      prev.map((q) => (q.tableId === tableId ? { ...q, active: !q.active } : q))
    );
  }, []);

  const regenerateQr = useCallback((tableId: number) => {
    const token = randomToken();
    setQrTokens((prev) =>
      prev.map((q) => (q.tableId === tableId ? { ...q, token, active: true } : q))
    );
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, qrToken: token } : t))
    );
    if (!supabaseAvailable.current) return;
    supabase.from("tables").update({ qr_token: token }).eq("id", tableId);
  }, []);

  const saveStaffAvatar = useCallback((staffId: string, url: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, avatarUrl: url } : s))
    );
    if (!supabaseAvailable.current) return;
    supabase.from("staff").update({ avatar_url: url }).eq("id", staffId);
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
    setDemoMode,
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
    fromRole: (r.from_role as string) ?? "client",
    text: (r.text as string) ?? "",
    status: (r.status as string) ?? "unread",
    createdAt: (r.created_at as string) ?? new Date().toISOString(),
  };
}
