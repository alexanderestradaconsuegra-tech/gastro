import { NextRequest, NextResponse } from "next/server";
import { WEBHOOKS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  if (!WEBHOOKS.luka.startsWith("http")) {
    return NextResponse.json({ reply: "Luka no configurado", ok: false }, { status: 503 });
  }
  try {
    const body = await req.json();
    const res = await fetch(WEBHOOKS.luka, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return NextResponse.json({ reply: "Error contactando a Luka", ok: false, detail: txt }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "timeout";
    return NextResponse.json({ reply: "Luka no responde, intenta de nuevo", ok: false, detail: msg }, { status: 504 });
  }
}
