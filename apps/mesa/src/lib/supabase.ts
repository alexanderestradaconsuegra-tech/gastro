import { createClient } from "@supabase/supabase-js";

const HARDCODED_URL = "https://nlwrkumlrudfgsdnhfhw.supabase.co";
const HARDCODED_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sd3JrdW1scnVkZmdzZG5oZmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODc1NTgsImV4cCI6MjA5NDE2MzU1OH0.Bi0v-temjfU-BDFVuyJTyc_19ZRx-T_we3MfeEkcsfg";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? HARDCODED_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? HARDCODED_ANON;

// Single instance reused across the client bundle (realtime only)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

// ── Direct REST helpers (bypass supabase-js which hangs on auth-queue init) ──

export async function sbFetch<T = Record<string, unknown>>(
  table: string,
  qs: string
): Promise<T[]> {
  const res = await fetch(`${HARDCODED_URL}/rest/v1/${table}?${qs}`, {
    headers: {
      apikey: HARDCODED_ANON,
      Authorization: `Bearer ${HARDCODED_ANON}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${table} ${res.status}: ${text}`);
  }
  return res.json() as Promise<T[]>;
}

// ── DB row types ────────────────────────────────────────────────────────────

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
  status: "received" | "prep" | "plating" | "served";
  eta_minutes: number | null;
  notes: string | null;
  total: number;
  created_at: string;
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
