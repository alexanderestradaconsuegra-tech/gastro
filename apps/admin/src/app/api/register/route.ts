import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://nlwrkumlrudfgsdnhfhw.supabase.co";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY ?? "";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function POST(req: NextRequest) {
  if (!SERVICE_KEY) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  let body: { restaurantName?: string; ownerName?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { restaurantName, ownerName, email, password } = body;

  if (!restaurantName?.trim() || !ownerName?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
  }

  if (password.length < 4) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 4 caracteres" }, { status: 400 });
  }

  // Generate a unique restaurant ID
  const slug = slugify(restaurantName.trim());
  const suffix = Math.random().toString(36).slice(2, 6);
  const restaurantId = `${slug}-${suffix}`;

  const headers = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  };

  // 1. Create restaurant row
  const resRestaurant = await fetch(`${SUPABASE_URL}/rest/v1/restaurants`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({
      id: restaurantId,
      name: restaurantName.trim(),
      settings: {},
    }),
  });

  if (!resRestaurant.ok) {
    const text = await resRestaurant.text().catch(() => "");
    console.error("[register] create restaurant failed:", resRestaurant.status, text);
    return NextResponse.json({ error: "Error al crear el restaurante" }, { status: 500 });
  }

  // 2. Create Supabase Auth user with restaurant_id in metadata
  const resUser = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { restaurant_id: restaurantId },
    }),
  });

  if (!resUser.ok) {
    const errData = await resUser.json().catch(() => ({})) as Record<string, string>;
    // Clean up restaurant if user creation failed
    await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${restaurantId}`, {
      method: "DELETE",
      headers,
    });
    const msg = errData.msg ?? errData.message ?? errData.error_description ?? "Error al crear el usuario";
    if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("duplicate")) {
      return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const userData = await resUser.json() as { id: string };

  // 3. Create admin staff row
  const resStaff = await fetch(`${SUPABASE_URL}/rest/v1/staff`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({
      restaurant_id: restaurantId,
      name: ownerName.trim(),
      email: email.trim().toLowerCase(),
      role: "admin",
      status: "Activo",
    }),
  });

  if (!resStaff.ok) {
    // Non-fatal — user and restaurant already created, log and continue
    const text = await resStaff.text().catch(() => "");
    console.warn("[register] create staff failed (non-fatal):", resStaff.status, text);
  }

  console.log("[register] new restaurant created:", restaurantId, "user:", userData.id);

  return NextResponse.json({ ok: true, restaurantId });
}
