import { NextRequest, NextResponse } from "next/server";

const LUKA_URL = process.env.N8N_WEBHOOK_BASE_URL
  ? `${process.env.N8N_WEBHOOK_BASE_URL}/webhook/d553eaf3-6e79-4904-a234-7e47fcf7344d`
  : "";

export async function POST(req: NextRequest) {
  if (!LUKA_URL) {
    return NextResponse.json({ reply: "Servicio Luka no configurado", ok: false }, { status: 503 });
  }
  try {
    const body = await req.json();
    const res = await fetch(LUKA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return NextResponse.json({ reply: "Error al contactar a Luka", ok: false, detail: txt }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "timeout";
    return NextResponse.json({ reply: "Luka no responde, intenta de nuevo", ok: false, detail: msg }, { status: 504 });
  }
}
