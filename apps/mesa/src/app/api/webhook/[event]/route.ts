import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nlwrkumlrudfgsdnhfhw.supabase.co";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY ?? "";
const ANON_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sd3JrdW1scnVkZmdzZG5oZmh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODc1NTgsImV4cCI6MjA5NDE2MzU1OH0.Bi0v-temjfU-BDFVuyJTyc_19ZRx-T_we3MfeEkcsfg";

const key = SERVICE_KEY || ANON_KEY;
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
};
const headersReturn = { ...headers, Prefer: "return=representation" };

function orderId(): string {
  return `ORD-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
}

async function sb(path: string, method: string, body?: unknown, prefer?: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: prefer ? { ...headers, Prefer: prefer } : headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

// ── order-create: session + order + order_items + update table status ──
async function handleOrderCreate(data: Record<string, unknown>) {
  const { restaurant_id, table_id, session_id, qr_token, notes, total, items, priority, channel, eta_minutes } = data;

  if (!restaurant_id || !table_id || !session_id || !items) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 1. Upsert session (ignore if exists)
  await fetch(`${SUPABASE_URL}/rest/v1/sessions`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({
      id: session_id,
      restaurant_id,
      table_id,
      qr_token: qr_token ?? "",
      status: "active",
    }),
  });

  // 2. Create order
  const oid = orderId();
  const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: "POST",
    headers: headersReturn,
    body: JSON.stringify({
      id: oid,
      restaurant_id,
      session_id,
      table_id,
      status: "received",
      priority: priority ?? "Normal",
      channel: channel ?? "QR Mesa",
      eta_minutes: eta_minutes ?? 18,
      notes: notes ?? null,
      total: total ?? 0,
    }),
  });

  if (!orderRes.ok) {
    const text = await orderRes.text().catch(() => "");
    console.error("[order-create] insert order failed:", orderRes.status, text);
    return NextResponse.json({ error: "Failed to create order", detail: text }, { status: 500 });
  }

  // 3. Insert order items
  const itemsArr = items as Array<{ menu_item_id: string; dish_name: string; unit_price: number; qty: number }>;
  if (itemsArr.length > 0) {
    const itemRows = itemsArr.map((it) => ({
      order_id: oid,
      menu_item_id: it.menu_item_id,
      dish_name: it.dish_name,
      unit_price: it.unit_price,
      qty: it.qty,
      status: "pending",
    }));
    const itemsRes = await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
      method: "POST",
      headers,
      body: JSON.stringify(itemRows),
    });
    if (!itemsRes.ok) {
      console.error("[order-create] insert items failed:", await itemsRes.text().catch(() => ""));
    }
  }

  // 4. Update table status to "Pedido nuevo"
  await fetch(
    `${SUPABASE_URL}/rest/v1/tables?id=eq.${table_id}&restaurant_id=eq.${encodeURIComponent(String(restaurant_id))}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        status: "Pedido nuevo",
        last_activity_at: new Date().toISOString(),
      }),
    }
  );

  return NextResponse.json({ ok: true, order_id: oid });
}

// ── camarero-call: insert call + update table ──
async function handleCamareroCall(data: Record<string, unknown>) {
  const { restaurant_id, table_id, session_id, call_type, message, priority } = data;

  if (!restaurant_id || !table_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const callRes = await fetch(`${SUPABASE_URL}/rest/v1/calls`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      restaurant_id,
      table_id,
      session_id: session_id ?? null,
      source: "mesa",
      call_type: call_type ?? "Llamar camarero",
      priority: priority ?? "Normal",
      status: "Pendiente",
      message: message ?? null,
    }),
  });

  if (!callRes.ok) {
    const text = await callRes.text().catch(() => "");
    console.error("[camarero-call] insert failed:", callRes.status, text);
    return NextResponse.json({ error: "Failed to create call" }, { status: 500 });
  }

  // Update table status
  await fetch(
    `${SUPABASE_URL}/rest/v1/tables?id=eq.${table_id}&restaurant_id=eq.${encodeURIComponent(String(restaurant_id))}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        status: "Camarero ocupado",
        last_activity_at: new Date().toISOString(),
      }),
    }
  );

  return NextResponse.json({ ok: true });
}

// ── bill-request: insert call of type "Solicita cobro" + update table ──
async function handleBillRequest(data: Record<string, unknown>) {
  const { restaurant_id, table_id, session_id, amount } = data;

  if (!restaurant_id || !table_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await fetch(`${SUPABASE_URL}/rest/v1/calls`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      restaurant_id,
      table_id,
      session_id: session_id ?? null,
      source: "mesa",
      call_type: "Solicita cobro",
      priority: "Alta",
      status: "Pendiente",
      message: amount ? `Monto: $${amount}` : "Solicita la cuenta",
    }),
  });

  await fetch(
    `${SUPABASE_URL}/rest/v1/tables?id=eq.${table_id}&restaurant_id=eq.${encodeURIComponent(String(restaurant_id))}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        status: "Solicita cobro",
        bill_total: amount ?? 0,
        last_activity_at: new Date().toISOString(),
      }),
    }
  );

  return NextResponse.json({ ok: true });
}

// ── feedback: insert review ──
async function handleFeedback(data: Record<string, unknown>) {
  const { restaurant_id, table_id, session_id, rating, comment, source } = data;

  if (!restaurant_id || !table_id || !rating) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      restaurant_id,
      table_id,
      session_id: session_id ?? null,
      rating,
      comment: comment ?? null,
      source: source ?? "QR Mesa",
    }),
  });

  return NextResponse.json({ ok: true });
}

const HANDLERS: Record<string, (data: Record<string, unknown>) => Promise<NextResponse>> = {
  "order-create": handleOrderCreate,
  "camarero-call": handleCamareroCall,
  "bill-request": handleBillRequest,
  feedback: handleFeedback,
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ event: string }> }
) {
  const { event } = await params;
  const handler = HANDLERS[event];

  if (!handler) {
    return NextResponse.json({ error: "Unknown event" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    return await handler(body);
  } catch (err) {
    console.error(`[webhook/${event}] error:`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
