import { createClient, SupabaseClient } from "@supabase/supabase-js";

declare global {
  interface Window { __SB_URL__?: string; __SB_KEY__?: string; }
}

// The anon key is intentionally public — it only grants access governed by RLS policies.
// Service role key (bypasses RLS) must NEVER appear in client code.
const HARDCODED_URL = "https://nlwrkumlrudfgsdnhfhw.supabase.co";
const HARDCODED_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sd3JrdW1scnVkZmdzZG5oZmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODc1NTgsImV4cCI6MjA5NDE2MzU1OH0.Bi0v-temjfU-BDFVuyJTyc_19ZRx-T_we3MfeEkcsfg";

function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof window !== "undefined" ? window.__SB_URL__ : undefined) ||
    HARDCODED_URL
  );
}

function getSupabaseKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof window !== "undefined" ? window.__SB_KEY__ : undefined) ||
    HARDCODED_ANON
  );
}

export function isSupabaseConfigured(): boolean {
  return !!(getSupabaseUrl() && getSupabaseKey());
}

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;
  _client = createClient(getSupabaseUrl(), getSupabaseKey(), {
    auth: { autoRefreshToken: true, persistSession: true },
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? (value as Function).bind(client) : value;
  },
});

export interface DbRestaurant {
  id: string;
  name: string;
  legal_name: string | null;
  rut: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  settings: Record<string, unknown> | null;
}

export interface DbTable {
  id: number;
  restaurant_id: string;
  table_number: number;
  label: string;
  zone: string;
  qr_token: string;
  status: string;
  guests: number | null;
  waiter_id: string | null;
  active: boolean;
  bill: number | null;
  tip_accepted: boolean | null;
  tip_amount: number | null;
}

export interface DbStaff {
  id: string;
  restaurant_id: string;
  name: string;
  email: string;
  role: "admin" | "camarero" | "cocina" | "caja";
  pin: string | null;
  shift: string | null;
  status: string;
  avatar_url: string | null;
  phone: string | null;
}

export interface DbMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  price: number;
  avg_prep_minutes: number | null;
  kcal: number | null;
  tags: string[] | null;
  allergens: string[] | null;
  wine_pair: string | null;
  image_url: string | null;
  stock_status: string;
  available: boolean;
  visible_client: boolean;
}

export interface DbOrder {
  id: string;
  restaurant_id: string;
  session_id: string;
  table_id: number;
  waiter_id: string | null;
  status: "received" | "prep" | "plating" | "served" | "cancelled";
  priority: string;
  channel: string;
  eta_minutes: number | null;
  notes: string | null;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  dish_name: string;
  qty: number;
  unit_price: number;
  status: string;
}

export interface DbCall {
  id: string;
  restaurant_id: string;
  table_id: number;
  session_id: string;
  waiter_id: string | null;
  source: string;
  call_type: string;
  priority: string;
  status: "Pendiente" | "En atención" | "Resuelto";
  message: string;
  created_at: string;
  resolved_at: string | null;
}

export interface DbMessage {
  id: number;
  restaurant_id: string;
  table_id: number;
  session_id: string;
  waiter_id: string | null;
  from_role: string;
  message_type: string;
  text: string;
  status: string;
  created_at: string;
}

export interface DbCashSession {
  id: string;
  restaurant_id: string;
  opened_by: string;
  closed_by: string | null;
  turn: string;
  status: "abierta" | "cerrada";
  opening_cash: number;
  cash_total: number;
  card_total: number;
  transfer_total: number;
  tips_total: number;
  expenses_total: number;
  opened_at: string;
  closed_at: string | null;
}

export interface DbExpense {
  id: string;
  restaurant_id: string;
  cash_session_id: string;
  staff_id: string;
  expense_type: string;
  detail: string;
  amount: number;
  created_at: string;
}

export interface DbInventory {
  id: string;
  restaurant_id: string;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
  unit: string;
  linked_dishes: string[] | null;
}

export interface DbReview {
  id: string;
  restaurant_id: string;
  session_id: string;
  table_id: number;
  waiter_id: string | null;
  rating: number;
  comment: string | null;
  source: string;
  created_at: string;
}
