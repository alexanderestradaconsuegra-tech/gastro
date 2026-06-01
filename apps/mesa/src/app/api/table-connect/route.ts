import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nlwrkumlrudfgsdnhfhw.supabase.co";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY ?? "";

// Called server-side when a customer scans a QR code.
// Updates the table status to "Conectado" so admin/camarero can see
// someone is seated even before they place their first order.
export async function POST(req: NextRequest) {
  let qr_token: string | undefined;
  try {
    ({ qr_token } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!qr_token) {
    return NextResponse.json({ error: "qr_token required" }, { status: 400 });
  }

  if (!SERVICE_KEY) {
    // Dev mode without service key — ignore silently
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/tables?qr_token=eq.${encodeURIComponent(qr_token)}&status=eq.Libre`,
      {
        method: "PATCH",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: "Conectado",
          last_activity_at: new Date().toISOString(),
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[table-connect] PATCH failed:", res.status, text);
      return NextResponse.json({ ok: false }, { status: 200 }); // non-fatal for client
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[table-connect] error:", err);
    return NextResponse.json({ ok: false }, { status: 200 }); // non-fatal
  }
}
