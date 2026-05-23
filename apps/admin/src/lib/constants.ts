export type OrderStatus = "received" | "prep" | "plating" | "served" | "cancelled";
export type CallStatus = "Pendiente" | "En atención" | "Resuelto";
export type StaffRole = "admin" | "camarero" | "cocina" | "caja";
export type TableStatus =
  | "Libre"
  | "Comiendo"
  | "Esperando plato"
  | "Pedido nuevo"
  | "Solicita cobro"
  | "Camarero ocupado";

export interface OrderItem {
  dish: string;
  qty: number;
  status: string;
  price: number;
}

export interface Order {
  id: string;
  tableId: number;
  waiterId: string;
  status: OrderStatus;
  priority: string;
  eta: number;
  channel: string;
  items: OrderItem[];
  notes: string;
  total?: number;
}

export interface Table {
  id: number;
  zone: string;
  status: TableStatus;
  guests: number;
  waiterId: string | null;
  bill: number;
  qrToken: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  shift: string;
  status: string;
  tables: number[];
  phone: string;
  email: string;
  avatarUrl?: string;
}

export interface Call {
  id: string;
  source: string;
  tableId: number;
  waiterId: string;
  type: string;
  priority: string;
  status: CallStatus;
  message: string;
  createdAt: number;
}

export interface Message {
  id: number;
  tableId: number;
  sessionId: string;
  fromRole: string;
  text: string;
  status: string;
  createdAt: string;
}

export interface CashSession {
  id: string;
  status: "abierta" | "cerrada";
  openedAt: string;
  turn: string;
  openedBy: string;
  openingCash: number;
  cash: number;
  card: number;
  transfer: number;
  tips: number;
  expenses: number;
}

export interface Expense {
  id: string;
  type: string;
  detail: string;
  amount: number;
  createdAt: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  linkedDishes: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: string;
  price: number;
  avgPrepMinutes: number;
  kcal: number;
  tags: string[];
  allergens: string[];
  winePair: string;
  imageUrl: string;
  stockStatus: string;
  available: boolean;
  visibleClient: boolean;
}

export interface Review {
  id: string;
  tableId: number;
  waiterId: string;
  rating: number;
  comment: string;
  source: string;
  createdAt: string;
}

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ORD-1047",
    tableId: 7,
    waiterId: "w1",
    status: "prep",
    priority: "Normal",
    eta: 9,
    channel: "QR Mesa",
    items: [
      { dish: "Tagliatelle al Ragù", qty: 1, status: "Preparando", price: 21500 },
      { dish: "Spritz Aperol", qty: 2, status: "Listo", price: 9800 },
    ],
    notes: "",
  },
  {
    id: "ORD-1046",
    tableId: 2,
    waiterId: "w2",
    status: "plating",
    priority: "Alta",
    eta: 5,
    channel: "QR Mesa",
    items: [{ dish: "Branzino al Forno", qty: 1, status: "Emplatando", price: 28900 }],
    notes: "Sin hinojo",
  },
  {
    id: "ORD-1045",
    tableId: 9,
    waiterId: "w3",
    status: "received",
    priority: "Normal",
    eta: 22,
    channel: "QR Mesa",
    items: [{ dish: "Osso Buco Milanese", qty: 2, status: "Pendiente", price: 32500 }],
    notes: "",
  },
];

export const INITIAL_TABLES: Table[] = [
  { id: 1, zone: "Salón", status: "Libre", guests: 0, waiterId: null, bill: 0, qrToken: "T001" },
  { id: 2, zone: "Salón", status: "Comiendo", guests: 3, waiterId: "w2", bill: 64900, qrToken: "B2M18" },
  { id: 3, zone: "Terraza", status: "Libre", guests: 0, waiterId: null, bill: 0, qrToken: "T003" },
  { id: 4, zone: "Terraza", status: "Esperando plato", guests: 2, waiterId: "w1", bill: 29800, qrToken: "T004" },
  { id: 5, zone: "Bar", status: "Camarero ocupado", guests: 1, waiterId: "w2", bill: 14500, qrToken: "T005" },
  { id: 6, zone: "Bar", status: "Libre", guests: 0, waiterId: null, bill: 0, qrToken: "T006" },
  { id: 7, zone: "Salón", status: "Pedido nuevo", guests: 4, waiterId: "w1", bill: 84900, qrToken: "A7K92" },
  { id: 8, zone: "VIP", status: "Solicita cobro", guests: 6, waiterId: "w3", bill: 192400, qrToken: "T008" },
  { id: 9, zone: "VIP", status: "Comiendo", guests: 2, waiterId: "w3", bill: 65000, qrToken: "VIP09" },
];

export const INITIAL_STAFF: StaffMember[] = [
  { id: "w1", name: "Marco Ferrán", role: "camarero", shift: "18:00–00:00", status: "Activo", tables: [4, 7], phone: "+56 9 1234 5678", email: "marco@nido.cl" },
  { id: "w2", name: "Isabella Ruiz", role: "camarero", shift: "19:00–01:00", status: "Activo", tables: [2, 5], phone: "+56 9 2345 6789", email: "isabella@nido.cl" },
  { id: "w3", name: "Tomás Vera", role: "camarero", shift: "18:00–00:00", status: "Pausa", tables: [8, 9], phone: "+56 9 3456 7890", email: "tomas@nido.cl" },
  { id: "a1", name: "Valentina Cruz", role: "admin", shift: "Full", status: "Activo", tables: [], phone: "+56 9 4567 8901", email: "admin@nido.cl" },
];

export const INITIAL_CALLS: Call[] = [
  { id: "C-001", source: "mesa", tableId: 7, waiterId: "w1", type: "Solicita cobro", priority: "Alta", status: "Pendiente", message: "Queremos pedir la cuenta", createdAt: Date.now() - 60000 },
  { id: "C-002", source: "cocina", tableId: 2, waiterId: "w2", type: "Confirmar plato", priority: "Normal", status: "En atención", message: "¿Sin hinojo para mesa 2?", createdAt: Date.now() - 120000 },
  { id: "C-003", source: "mesa", tableId: 9, waiterId: "w3", type: "Alergia", priority: "Crítica", status: "Pendiente", message: "Cliente tiene alergia a nueces", createdAt: Date.now() - 30000 },
];

export const INITIAL_MESSAGES: Message[] = [
  { id: 1, tableId: 7, sessionId: "sess-7", fromRole: "client", text: "¿Tienen opciones sin gluten?", status: "unread", createdAt: new Date(Date.now() - 300000).toISOString() },
  { id: 2, tableId: 2, sessionId: "sess-2", fromRole: "client", text: "La comida está excelente, gracias", status: "read", createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: 3, tableId: 8, sessionId: "sess-8", fromRole: "client", text: "Necesitamos la cuenta cuando puedan", status: "unread", createdAt: new Date(Date.now() - 120000).toISOString() },
];

export const INITIAL_CASH_SESSION: CashSession = {
  id: "SHIFT-2026-05-18-NOCHE",
  status: "abierta",
  openedAt: "18:00",
  turn: "Noche",
  openedBy: "a1",
  openingCash: 150000,
  cash: 428500,
  card: 691200,
  transfer: 118000,
  tips: 29150,
  expenses: 42000,
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: "inv1", name: "Pasta fresca", category: "Abarrotes", stock: 8, minStock: 5, unit: "kg", linkedDishes: ["Tagliatelle al Ragù"] },
  { id: "inv2", name: "Branzino", category: "Pescados", stock: 3, minStock: 4, unit: "unidades", linkedDishes: ["Branzino al Forno"] },
  { id: "inv3", name: "Osso Buco", category: "Carnes", stock: 12, minStock: 6, unit: "porciones", linkedDishes: ["Osso Buco Milanese"] },
  { id: "inv4", name: "Vino tinto reserva", category: "Bebidas", stock: 24, minStock: 10, unit: "botellas", linkedDishes: [] },
  { id: "inv5", name: "Aperol", category: "Bebidas", stock: 6, minStock: 3, unit: "botellas", linkedDishes: ["Spritz Aperol"] },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  { id: "m1", name: "Tagliatelle al Ragù", subtitle: "Pasta fresca con ragù de ternera", description: "Tagliatelle artesanal con ragù de ternera cocinado a fuego lento durante 6 horas", category: "Pastas", price: 21500, avgPrepMinutes: 15, kcal: 620, tags: ["signature"], allergens: ["gluten", "huevos"], winePair: "Barolo 2018", imageUrl: "", stockStatus: "ok", available: true, visibleClient: true },
  { id: "m2", name: "Branzino al Forno", subtitle: "Lubina al horno con hierbas", description: "Lubina mediterránea al horno con hierbas frescas y aceite de oliva", category: "Pescados", price: 28900, avgPrepMinutes: 20, kcal: 480, tags: ["sin gluten"], allergens: ["pescado"], winePair: "Pinot Grigio", imageUrl: "", stockStatus: "low", available: true, visibleClient: true },
  { id: "m3", name: "Osso Buco Milanese", subtitle: "Jarrete de ternera con gremolata", description: "Jarrete de ternera braseado al estilo milanés con gremolata y risotto", category: "Carnes", price: 32500, avgPrepMinutes: 25, kcal: 780, tags: ["signature", "popular"], allergens: ["gluten", "lácteos"], winePair: "Amarone 2017", imageUrl: "", stockStatus: "ok", available: true, visibleClient: true },
  { id: "m4", name: "Spritz Aperol", subtitle: "Cóctel refrescante", description: "Aperol, prosecco y un toque de soda con naranja", category: "Bebidas", price: 9800, avgPrepMinutes: 3, kcal: 180, tags: [], allergens: [], winePair: "", imageUrl: "", stockStatus: "ok", available: true, visibleClient: true },
];

export const INITIAL_REVIEWS: Review[] = [
  { id: "r1", tableId: 7, waiterId: "w1", rating: 5, comment: "Excelente servicio y comida increíble", source: "QR Mesa", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "r2", tableId: 2, waiterId: "w2", rating: 4, comment: "Muy buena experiencia, el Branzino delicioso", source: "QR Mesa", createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "r3", tableId: 5, waiterId: "w2", rating: 3, comment: "Esperamos un poco, pero valió la pena", source: "QR Mesa", createdAt: new Date(Date.now() - 10800000).toISOString() },
];

export const WEBHOOKS = {
  orderCreate: (process.env.N8N_WEBHOOK_BASE_URL ?? "") + "/webhook/order-create",
  camareroCall: (process.env.N8N_WEBHOOK_BASE_URL ?? "") + "/webhook/camarero-call",
  kitchenCall: (process.env.N8N_WEBHOOK_BASE_URL ?? "") + "/webhook/kitchen-call",
  billRequest: (process.env.N8N_WEBHOOK_BASE_URL ?? "") + "/webhook/bill-request",
  receiptPrint: (process.env.N8N_WEBHOOK_BASE_URL ?? "") + "/webhook/receipt-print",
  feedback: (process.env.N8N_WEBHOOK_BASE_URL ?? "") + "/webhook/feedback",
  cashClose: (process.env.N8N_WEBHOOK_BASE_URL ?? "") + "/webhook/cash-close",
  luka: (process.env.N8N_WEBHOOK_BASE_URL ?? "") + "/webhook/d553eaf3-6e79-4904-a234-7e47fcf7344d",
} as const;

export const STATUS_COLORS: Record<string, string> = {
  Libre: "#34d399",
  Comiendo: "#60a5fa",
  "Esperando plato": "#f59e0b",
  "Pedido nuevo": "#a78bfa",
  "Solicita cobro": "#f87171",
  "Camarero ocupado": "#f97316",
};

export const PRIORITY_COLORS: Record<string, string> = {
  Normal: "#9992b4",
  Alta: "#f59e0b",
  Crítica: "#f87171",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  received: "Recibido",
  prep: "Preparando",
  plating: "Emplatando",
  served: "Servido",
  cancelled: "Cancelado",
};

export const ADMIN_TABS = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "tables", label: "Mesas", icon: "⊞" },
  { id: "comanda", label: "Comanda", icon: "✎" },
  { id: "orders", label: "Órdenes", icon: "≡" },
  { id: "kitchen", label: "Cocina", icon: "◉" },
  { id: "calls", label: "Llamados", icon: "◎" },
  { id: "messages", label: "Mensajes", icon: "✉" },
  { id: "sales", label: "Caja", icon: "$" },
  { id: "staff", label: "Personal", icon: "⊙" },
  { id: "inventory", label: "Inventario", icon: "▦" },
  { id: "qr", label: "QR", icon: "⬡" },
  { id: "menu", label: "Carta", icon: "▤" },
  { id: "reviews", label: "Reseñas", icon: "★" },
  { id: "settings", label: "Config", icon: "⚙" },
] as const;

export const CAMARERO_TABS = ["dashboard", "tables", "orders", "kitchen", "calls", "messages", "reviews"] as const;

export type TabId = typeof ADMIN_TABS[number]["id"];
