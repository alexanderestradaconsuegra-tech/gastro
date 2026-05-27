"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRestaurantId, isSupabaseConfigured, sbDelete, sbInsert, sbPatch, sbRpc, sbSelect, sbUpsert, supabase } from "@/lib/supabase";
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
  StaffRole,
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
  notifyWaiter: (tableId: number, waiterId: string, orderId: string, dishes: string) => void;
  submitWaiterOrder: (tableId: number, staffId: string, items: Array<{ menuItemId: string; dishName: string; qty: number; unitPrice: number }>, notes: string) => Promise<{ ok: boolean; error?: string }>;
  saveStaffAvatar: (staffId: string, url: string) => void;
  saveStaff: (staff: StaffMember) => Promise<{ ok: boolean; error?: string }>;
  createStaff: (name: string, email: string, role: StaffRole, pin: string, shift: string) => Promise<{ ok: boolean; error?: string }>;
  deleteStaff: (staffId: string) => Promise<void>;
  createTable: (zone: string, capacity: number) => Promise<void>;
  updateTable: (id: number, data: Partial<Pick<Table, "zone" | "guests">>) => Promise<void>;
  deleteTable: (id: number) => Promise<void>;
  clearDemoData: () => Promise<void>;
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
          sbSelect("orders", "select=*&status=not.in.(served,cancelled)&order=created_at.desc&limit=200"),
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

    sbSelect("expenses", "select=*&order=created_at.desc&limit=100")
      .then((data) => {
        if (data.length) setExpenses((data as Record<string, unknown>[]).map((r) => ({
          id: r.id as string,
          type: (r.expense_type as string) ?? "Caja",
          detail: (r.detail as string) ?? "",
          amount: (r.amount as number) ?? 0,
          createdAt: new Date(r.created_at as string).getTime(),
        })));
      })
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
    await sbPatch("orders", { id: orderId }, { status, updated_at: new Date().toISOString() });
  }, []);

  const attendCall = useCallback((callId: string) => {
    setCalls((prev) => prev.map((c) => (c.id === callId ? { ...c, status: "En atención" } : c)));
    if (!supabaseAvailable.current) return;
    sbPatch("calls", { id: callId }, { status: "En atención" }).catch(() => {});
  }, []);

  const resolveCall = useCallback((callId: string) => {
    setCalls((prev) => prev.map((c) => (c.id === callId ? { ...c, status: "Resuelto" } : c)));
    if (!supabaseAvailable.current) return;
    sbPatch("calls", { id: callId }, { status: "Resuelto", resolved_at: new Date().toISOString() }).catch(() => {});
  }, []);

  const resolveMessage = useCallback((msgId: number) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, status: "resuelto" } : m)));
    if (!supabaseAvailable.current) return;
    sbPatch("messages", { id: msgId }, { status: "resuelto" }).catch(() => {});
  }, []);

  const assignWaiter = useCallback((tableId: number, waiterId: string) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, waiterId } : t)));
    if (!supabaseAvailable.current) return;
    sbPatch("tables", { id: tableId }, { waiter_id: waiterId }).catch(() => {});
  }, []);

  const setTableTip = useCallback((tableId: number, accepted: boolean, suggestedAmount: number) => {
    const tipAmount = accepted ? suggestedAmount : 0;
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, tipAccepted: accepted, tipAmount } : t))
    );
    if (!supabaseAvailable.current) return;
    sbPatch("tables", { id: tableId }, { tip_accepted: accepted, tip_amount: tipAmount }).catch(() => {});
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

    sbPatch(
      "orders",
      { table_id: tableId, status: ["received", "prep", "plating"] },
      { status: "served", updated_at: new Date().toISOString() }
    ).catch(() => {});

    sbPatch(
      "tables",
      { id: tableId },
      { status: "Libre", bill_total: 0, guests: 0, waiter_id: null, tip_accepted: false, tip_amount: 0 }
    ).catch(() => {});

    sbRpc("increment_cash_session", {
      p_amount_col: amountCol,
      p_amount: amount,
      p_tips: tipAmount,
    }).catch(() => {});
  }, []);

  const saveMenuItem = useCallback((item: MenuItem) => {
    setMenuItems((prev) => {
      const exists = prev.find((m) => m.id === item.id);
      return exists ? prev.map((m) => (m.id === item.id ? item : m)) : [...prev, item];
    });
    if (!supabaseAvailable.current) return;
    sbUpsert("menu_items", {
      id: item.id,
      restaurant_id: getRestaurantId(),
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
    }).catch(() => {});
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
    sbPatch("menu_items", { id: itemId }, { available: nextAvailable }).catch(() => {});
  }, []);

  const deleteMenuItem = useCallback((itemId: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== itemId));
    if (!supabaseAvailable.current) return;
    sbDelete("menu_items", { id: itemId }).catch(() => {});
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
    sbInsert("cash_sessions", {
      id,
      restaurant_id: getRestaurantId(),
      opened_by: null,
      turn: "Noche",
      status: "open",
      opening_cash: 150000,
    }).catch(() => {});
  }, []);

  const closeCash = useCallback(() => {
    let sessionId = "";
    setCashSession((prev) => { sessionId = prev.id; return { ...prev, status: "cerrada" }; });
    if (!supabaseAvailable.current) return;
    if (sessionId) {
      sbPatch("cash_sessions", { id: sessionId }, { status: "closed", closed_at: new Date().toISOString() }).catch(() => {});
    }
  }, []);

  const changeTurn = useCallback((turn: string) => {
    setCashSession((prev) => ({ ...prev, turn }));
  }, []);

  const addExpense = useCallback((type: string, detail: string, amount: number) => {
    const id = `E-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    setExpenses((prev) => [...prev, { id, type, detail, amount, createdAt: Date.now() }]);
    setCashSession((prev) => {
      const newExpensesTotal = prev.expenses + amount;
      if (supabaseAvailable.current) {
        sbInsert("expenses", {
          id,
          restaurant_id: getRestaurantId(),
          cash_session_id: prev.id || null,
          expense_type: type,
          detail,
          amount,
        }).catch(() => {});
        if (prev.id) {
          sbPatch("cash_sessions", { id: prev.id }, { expenses_total: newExpensesTotal }).catch(() => {});
        }
      }
      return { ...prev, expenses: newExpensesTotal };
    });
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
    sbPatch("inventory", { id: itemId }, { stock: newStock }).catch(() => {});
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
    sbPatch("tables", { id: tableId }, { qr_token: token }).catch(() => {});
  }, []);

  const saveStaffAvatar = useCallback((staffId: string, url: string) => {
    setStaff((prev) => prev.map((s) => (s.id === staffId ? { ...s, avatarUrl: url } : s)));
    if (!supabaseAvailable.current) return;
    sbPatch("staff", { id: staffId }, { avatar_url: url }).catch(() => {});
  }, []);

  const saveStaff = useCallback(async (staff: StaffMember): Promise<{ ok: boolean; error?: string }> => {
    setStaff((prev) => prev.map((s) => s.id === staff.id ? staff : s));
    if (!supabaseAvailable.current) return { ok: true };
    try {
      await sbUpsert("staff", {
        id: staff.id,
        restaurant_id: getRestaurantId(),
        name: staff.name,
        role: staff.role,
        shift: staff.shift || "",
        status: staff.status || "Activo",
        phone: staff.phone || "",
        email: staff.email || "",
        avatar_url: staff.avatarUrl || null,
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }, []);

  const createStaff = useCallback(async (name: string, email: string, role: StaffRole, pin: string, shift: string): Promise<{ ok: boolean; error?: string }> => {
    const rid = getRestaurantId();
    const n8nBase = process.env.NEXT_PUBLIC_N8N_WEBHOOK_BASE_URL ?? process.env.N8N_WEBHOOK_BASE_URL ?? "";
    if (n8nBase && !supabaseAvailable.current === false) {
      try {
        const res = await fetch(`${n8nBase}/webhook/staff-create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ restaurant_id: rid, name, email, password: pin, role, shift }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as Record<string, string>;
          return { ok: false, error: err.error ?? "Error al crear staff" };
        }
        // Optimistic local update; real data will arrive via next poll
        const newMember: StaffMember = { id: `staff-${Date.now()}`, name, email, role, shift, status: "Activo", tables: [], phone: "" };
        setStaff((prev) => [...prev, newMember]);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    }
    // Fallback: direct insert (dev/demo mode only — no Auth user created)
    const id = `staff-${Date.now()}`;
    const newMember: StaffMember = { id, name, email, role, shift, status: "Activo", tables: [], phone: "" };
    setStaff((prev) => [...prev, newMember]);
    if (!supabaseAvailable.current) return { ok: true };
    try {
      await sbInsert("staff", { id, restaurant_id: rid, name, email, role, shift, status: "Activo" });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }, []);

  const deleteStaff = useCallback(async (staffId: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== staffId));
    if (!supabaseAvailable.current) return;
    sbDelete("staff", { id: staffId }).catch(() => {});
  }, []);

  const createTable = useCallback(async (zone: string, capacity: number) => {
    const qrToken = randomToken();
    if (!supabaseAvailable.current) {
      setTables((prev) => {
        const id = Math.max(0, ...prev.map((t) => t.id)) + 1;
        return [...prev, { id, zone, status: "Libre", guests: capacity, waiterId: null, bill: 0, qrToken }];
      });
      return;
    }
    try {
      setTables((prev) => {
        const tableNumber = Math.max(0, ...prev.map((t) => t.id)) + 1;
        const newTable: Table = { id: tableNumber, zone, status: "Libre", guests: capacity, waiterId: null, bill: 0, qrToken };
        sbInsert("tables", {
          restaurant_id: getRestaurantId(),
          table_number: tableNumber,
          label: `Mesa ${tableNumber}`,
          zone,
          qr_token: qrToken,
          status: "Libre",
          guests: capacity,
        }).then(() => {
          sbSelect("tables", "select=*&order=id").then((data) => {
            setTables((data as Record<string, unknown>[]).map(mapDbTable));
            setQrTokens((data as Record<string, unknown>[]).map((r) => ({
              tableId: r.id as number,
              token: r.qr_token as string,
              active: r.active as boolean,
            })));
          }).catch(() => {});
        }).catch(() => {});
        return [...prev, newTable];
      });
    } catch { /* handled in inner catch */ }
  }, []);

  const updateTable = useCallback(async (id: number, data: Partial<Pick<Table, "zone" | "guests">>) => {
    setTables((prev) => prev.map((t) => t.id === id ? { ...t, ...data } : t));
    if (!supabaseAvailable.current) return;
    const patch: Record<string, unknown> = {};
    if (data.zone !== undefined) patch.zone = data.zone;
    if (data.guests !== undefined) patch.guests = data.guests;
    sbPatch("tables", { id }, patch).catch(() => {});
  }, []);

  const deleteTable = useCallback(async (id: number) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    if (!supabaseAvailable.current) return;
    sbDelete("tables", { id }).catch(() => {});
  }, []);

  const clearDemoData = useCallback(async () => {
    setMenuItems([]);
    if (!supabaseAvailable.current) return;
    await sbDelete("menu_items", { restaurant_id: getRestaurantId() }).catch(() => {});
  }, []);

  const submitWaiterOrder = useCallback(async (
    tableId: number,
    staffId: string,
    items: Array<{ menuItemId: string; dishName: string; qty: number; unitPrice: number }>,
    notes: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const total = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
    const orderId = `ORD-${Math.floor(Math.random() * 9000 + 1000)}`;
    const optimisticOrder: Order = {
      id: orderId,
      tableId,
      waiterId: staffId,
      status: "received",
      priority: "Normal",
      eta: 18,
      channel: "Camarero",
      items: items.map((i) => ({ dish: i.dishName, qty: i.qty, status: "Pendiente", price: i.unitPrice })),
      notes,
      total,
    };
    setOrders((prev) => [optimisticOrder, ...prev]);
    if (!supabaseAvailable.current) return { ok: true };
    try {
      await sbInsert("orders", {
        id: orderId,
        restaurant_id: getRestaurantId(),
        table_id: tableId,
        session_id: `waiter-${tableId}-${Date.now()}`,
        waiter_id: staffId,
        status: "received",
        priority: "Normal",
        channel: "Camarero",
        eta_minutes: 18,
        notes: notes || null,
        total,
      });
      for (const item of items) {
        await sbInsert("order_items", {
          id: `${orderId}-${item.menuItemId}-${Date.now()}`,
          order_id: orderId,
          menu_item_id: item.menuItemId,
          dish_name: item.dishName,
          qty: item.qty,
          unit_price: item.unitPrice,
          status: "pending",
        });
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Error al enviar pedido" };
    }
  }, []);

  const notifyWaiter = useCallback((tableId: number, waiterId: string, orderId: string, dishes: string) => {
    const id = `C-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
    const call: Call = {
      id,
      source: "cocina",
      tableId,
      waiterId,
      type: "Plato listo",
      priority: "Alta",
      status: "Pendiente",
      message: `Listo para servir: ${dishes} (${orderId})`,
      createdAt: Date.now(),
    };
    setCalls((prev) => [call, ...prev]);
    if (!supabaseAvailable.current) return;
    sbInsert("calls", {
      id,
      restaurant_id: getRestaurantId(),
      table_id: tableId,
      session_id: `kitchen-${tableId}-${Date.now()}`,
      waiter_id: waiterId,
      source: "cocina",
      call_type: "Plato listo",
      priority: "Alta",
      status: "Pendiente",
      message: call.message,
    }).catch(() => {});
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
    saveStaff,
    createStaff,
    deleteStaff,
    createTable,
    updateTable,
    deleteTable,
    clearDemoData,
    toggleQr,
    regenerateQr,
    notifyWaiter,
    submitWaiterOrder,
  };
}
