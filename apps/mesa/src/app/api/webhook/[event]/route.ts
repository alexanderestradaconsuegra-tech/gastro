import { NextRequest, NextResponse } from "next/server";

// Maps the URL segment to the n8n webhook path suffix.
// Keeps n8n URLs exclusively server-side.
const EVENT_PATHS: Record<string, string> = {
  "camarero-call": "/camarero-call",
  "order-create": "/order-create",
  "bill-request": "/bill-request",
  feedback: "/feedback",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ event: string }> }
) {
  const { event } = await params;
  const path = EVENT_PATHS[event];

  if (!path) {
    return NextResponse.json({ error: "Unknown event" }, { status: 404 });
  }

  const base = process.env.N8N_WEBHOOK_BASE_URL ?? process.env.NEXT_PUBLIC_N8N_WEBHOOK_BASE_URL ?? "https://n8n-n8n.fa2cjf.easypanel.host";
  if (!base) {
    // In dev without n8n configured, log and ack so the UI doesn't break
    const body = await req.json().catch(() => ({}));
    console.warn("[webhook proxy] N8N_WEBHOOK_BASE_URL not set — dropping:", event, body);
    return NextResponse.json({ ok: true, dropped: true });
  }

  const url = base.replace(/\/$/, "") + path;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    const status = upstream.ok ? 200 : upstream.status;

    return new NextResponse(text, {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[webhook proxy] fetch failed:", event, err);
    return NextResponse.json({ error: "Upstream unreachable" }, { status: 502 });
  }
}
