"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTableSession } from "@/hooks/useTableSession";
import type { CartItem, Order, TableContext } from "@/hooks/useTableSession";
import type { MenuItem } from "@/lib/constants";

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = "home" | "menu" | "order" | "waiter" | "bill" | "feedback" | "ai";

// ── Constants ────────────────────────────────────────────────────────────────

const RESTAURANT = {
  name: "NIDO",
  concept: "Cocina italiana de autor",
  city: "Santiago",
  googleReviewUrl: "https://g.page/r/CODIGO-DE-RESTAURANTE/review",
};

const PROMOS = [
  { eyebrow: "LUN–VIE", title: "Menú del Día", body: "Entrada + principal + postre + bebida", price: "$32.000" },
  { eyebrow: "18–20 H", title: "Aperitivo", body: "Spritz y cócteles seleccionados", price: "2×1" },
  { eyebrow: "CHEF", title: "Maridaje", body: "3 copas recomendadas por plato", price: "$18.900" },
];

const KITCHEN_STEPS = [
  { key: "received", label: "Recibido" },
  { key: "prep", label: "Preparando" },
  { key: "plating", label: "Emplatando" },
  { key: "served", label: "Servido" },
];

const WAITER_REASONS = [
  "Tomar pedido presencial",
  "Más agua",
  "Más servilletas",
  "Retirar platos",
  "Tengo una alergia",
  "Urgente en mesa",
];

const photos: Record<string, string> = {
  burrata: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=600&auto=format&fit=crop",
  carpaccio: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop",
  arancini: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=600&auto=format&fit=crop",
  tagliatelle: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=600&auto=format&fit=crop",
  branzino: "https://images.unsplash.com/photo-1535400255456-984241443b29?q=80&w=600&auto=format&fit=crop",
  ossobuco: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop",
  risotto: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=600&auto=format&fit=crop",
  tiramisu: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600&auto=format&fit=crop",
  panna: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop",
  spritz: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop",
  vino: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600&auto=format&fit=crop",
  agua: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=600&auto=format&fit=crop",
};

const icons = {
  home: <svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></svg>,
  menu: <svg viewBox="0 0 24 24"><path d="M4 5h16M4 12h16M4 19h16" /></svg>,
  order: <svg viewBox="0 0 24 24"><path d="M7 4h10l1 18-6-3-6 3Z" /></svg>,
  bell: <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M10 21h4" /></svg>,
  bill: <svg viewBox="0 0 24 24"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2ZM9 7h6M9 11h6M9 15h4" /></svg>,
  spark: <svg viewBox="0 0 24 24"><path d="M12 2l2.6 6.8L22 12l-7.4 3.2L12 22l-2.6-6.8L2 12l7.4-3.2Z" /></svg>,
  plus: <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>,
  minus: <svg viewBox="0 0 24 24"><path d="M5 12h14" /></svg>,
  x: <svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>,
  send: <svg viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z" /></svg>,
  search: <svg viewBox="0 0 24 24"><path d="m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" /></svg>,
  star: <svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21 7 14.2 2 9.3l6.9-1Z" /></svg>,
};

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
:root{--bg:#080705;--panel:#15120f;--panel2:#201a15;--line:rgba(255,255,255,.09);--text:#fff7ed;--muted:#bfae9d;--dim:#776a5d;--gold:#d9a441;--gold2:#f7d37b;--red:#ef4444;--green:#34d399;--r:22px;--shadow:0 26px 70px rgba(0,0,0,.45)}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 20% -10%,rgba(217,164,65,.22),transparent 32%),radial-gradient(circle at 110% 15%,rgba(126,58,242,.18),transparent 32%),#060504;color:var(--text);font-family:Inter,system-ui,sans-serif;overscroll-behavior:none}.app{max-width:430px;margin:0 auto;min-height:100dvh;position:relative;background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.01));box-shadow:0 0 0 1px rgba(255,255,255,.05),0 40px 110px rgba(0,0,0,.75);overflow:hidden}.screen{min-height:100dvh;padding:16px 16px 110px;overflow:auto}.fade{animation:fade .24s ease both}@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.glass{background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));border:1px solid var(--line);box-shadow:var(--shadow);backdrop-filter:blur(18px)}.hero{min-height:360px;border-radius:30px;overflow:hidden;position:relative;padding:22px;display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.72)),url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1400&auto=format&fit=crop') center/cover}.topbar{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center}.brand{font-family:'Playfair Display',serif;text-align:center;letter-spacing:.16em;color:var(--gold2);font-size:25px;line-height:.8}.brand small{display:block;font-family:Inter;font-size:8px;letter-spacing:.55em;color:#e9d2a0;margin-top:8px}.pill{border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.28);padding:9px 13px;border-radius:999px;color:#fff;font-weight:700;font-size:12px}.hero-copy{position:relative;z-index:1}.eyebrow{color:var(--gold2);font-weight:700;font-size:13px}.hero h1{font-family:'Playfair Display',serif;font-size:46px;line-height:.95;margin:10px 0 12px;letter-spacing:-.05em}.hero p{color:#e7dbce;margin:0;font-size:14px}.action-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}.action{border:1px solid var(--line);background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.035));border-radius:19px;min-height:104px;padding:16px;text-align:left;color:var(--text);cursor:pointer;transition:.18s transform,.18s border-color}.action:active{transform:scale(.98);border-color:rgba(217,164,65,.55)}.action svg,.nav svg,.icon svg,.btn svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.action svg{color:var(--gold2)}.action h3{margin:13px 0 5px;font-size:15px}.action p{margin:0;color:var(--muted);font-size:12px;line-height:1.45}.promo-row{display:grid;grid-template-columns:1fr;gap:10px;margin:16px 0 0}.promo{border-radius:20px;padding:14px 15px;display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center}.promo b{grid-column:1/-1;color:var(--gold2);font-size:10px;letter-spacing:.12em}.promo h3{margin:0;font-size:15px}.promo p{margin:0;color:var(--muted);font-size:12px;line-height:1.35}.promo strong{display:block;margin:0;color:var(--gold2);font-size:20px;justify-self:end}.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}.header-title{font-family:'Playfair Display',serif;font-size:23px}.icon{width:42px;height:42px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--text);display:grid;place-items:center}.section-title{display:flex;justify-content:space-between;align-items:end;margin:6px 2px 14px}.section-title h2{font-family:'Playfair Display',serif;font-size:31px;margin:0;letter-spacing:-.04em}.section-title span{color:var(--muted);font-size:12px}.searchbar{display:flex;gap:10px;align-items:center;margin-bottom:12px}.searchbox{flex:1;border:0;background:rgba(255,255,255,.06);border-radius:16px;padding:14px;color:white;outline:none}.cat-row{display:flex;gap:9px;overflow:auto;margin:0 -16px 14px;padding:0 16px}.cat-row::-webkit-scrollbar{display:none}.cat{white-space:nowrap;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--muted);border-radius:999px;padding:10px 14px;font-weight:800;font-size:12px}.cat.on{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#161006;border-color:transparent}.dish-list{display:flex;flex-direction:column;gap:12px}.dish{display:grid;grid-template-columns:88px 1fr auto;gap:12px;align-items:center;border-radius:20px;padding:10px}.photo{width:88px;height:88px;border-radius:16px;background-size:cover;background-position:center;background-image:linear-gradient(135deg,#3a2418,#0f0d0b)}.dish h3{margin:0;font-size:15px}.dish p{margin:5px 0 8px;color:var(--muted);font-size:12px;line-height:1.35}.tags{display:flex;gap:5px;flex-wrap:wrap}.tag{font-size:9px;font-weight:900;color:#201405;background:rgba(247,211,123,.92);border-radius:999px;padding:4px 7px}.price{color:var(--gold2);font-weight:900}.add{width:38px;height:38px;border-radius:14px;border:1px solid rgba(217,164,65,.5);background:rgba(217,164,65,.08);color:var(--gold2);display:grid;place-items:center}.floating-cart{position:fixed;left:16px;right:16px;bottom:84px;max-width:398px;margin:auto;z-index:25;border-radius:20px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#171006;border:0;padding:16px 18px;display:flex;justify-content:space-between;align-items:center;font-weight:900;box-shadow:0 18px 40px rgba(217,164,65,.28)}.nav{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:100%;max-width:430px;height:76px;background:rgba(7,6,5,.88);backdrop-filter:blur(22px);border-top:1px solid var(--line);display:grid;grid-template-columns:repeat(5,1fr);z-index:40;padding-bottom:env(safe-area-inset-bottom)}.nav button{position:relative;border:0;background:transparent;color:var(--dim);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-size:10px;font-weight:800}.nav button.on{color:var(--gold2)}.nav svg{width:20px;height:20px}.cart-badge{position:absolute;top:6px;right:22px;background:var(--red);color:white;border-radius:999px;font-size:10px;padding:2px 6px}.drawer{position:fixed;left:50%;bottom:0;transform:translate(-50%,105%);width:100%;max-width:430px;max-height:82dvh;z-index:60;background:rgba(15,12,9,.96);border:1px solid var(--line);border-radius:28px 28px 0 0;padding:18px;transition:.28s cubic-bezier(.2,.8,.2,1);box-shadow:0 -30px 80px rgba(0,0,0,.68);overflow:auto}.drawer.open{transform:translate(-50%,0)}.drawer-head{display:flex;align-items:center;justify-content:space-between}.drawer h2{font-family:'Playfair Display',serif;font-size:30px;margin:0}.cart-list{display:flex;flex-direction:column;gap:10px;margin:12px 0}.cart-item{display:flex;justify-content:space-between;align-items:center;border-radius:16px;background:rgba(255,255,255,.05);padding:12px}.cart-item h4{margin:0}.cart-item small{color:var(--muted)}.qty{display:flex;align-items:center;gap:10px}.qty button{width:32px;height:32px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.06);color:white;display:grid;place-items:center}.qty svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2}.total-row{display:flex;justify-content:space-between;color:var(--muted);margin:10px 0}.total-row.strong{color:white;font-size:20px}.btn{border:0;border-radius:18px;padding:15px 18px;font-weight:900;cursor:pointer}.btn.primary{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#171006}.btn.ghost{background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--text)}.empty{color:var(--muted);text-align:center;padding:24px}.status-card{border-radius:24px;padding:18px;margin-bottom:14px}.status-head{display:flex;justify-content:space-between;align-items:center}.status-head h3{margin:0}.status-head small{color:var(--muted)}.eta{background:rgba(52,211,153,.13);color:var(--green);padding:8px 12px;border-radius:999px;font-weight:900}.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:18px 0}.step{height:7px;border-radius:999px;background:rgba(255,255,255,.12)}.step.on{background:linear-gradient(90deg,var(--gold),var(--gold2))}.order-lines{color:var(--muted);font-size:13px;line-height:1.9}.waiter-hero{border-radius:28px;padding:26px;text-align:center}.bell-big{width:148px;height:148px;border-radius:50%;border:1px solid rgba(217,164,65,.4);background:radial-gradient(circle,rgba(217,164,65,.22),rgba(255,255,255,.03));color:var(--gold2);display:grid;place-items:center;margin:24px auto;position:relative}.bell-big svg{width:58px;height:58px;fill:none;stroke:currentColor;stroke-width:1.8}.bell-big.active{animation:pulse 1.2s infinite}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(217,164,65,.28)}50%{box-shadow:0 0 0 20px rgba(217,164,65,0)}}.quick-list{display:grid;gap:10px;margin-top:14px}.quick{border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--text);border-radius:17px;padding:15px;display:flex;justify-content:space-between;font-weight:800}.bill-card,.review-card{border-radius:26px;padding:18px}.bill-line{display:flex;justify-content:space-between;padding:13px 0;border-bottom:1px solid var(--line)}.bill-line small{display:block;color:var(--muted);margin-top:4px}.chat{height:100dvh;padding:16px 14px 0;display:flex;flex-direction:column}.messages{flex:1;overflow:auto;padding:8px 2px 12px;display:flex;flex-direction:column;gap:10px}.msg{max-width:82%;border-radius:18px;padding:12px 14px;font-size:13px;line-height:1.55}.msg.ai{align-self:flex-start;background:rgba(255,255,255,.07);border:1px solid var(--line);border-bottom-left-radius:4px}.msg.user{align-self:flex-end;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#171006;border-bottom-right-radius:4px}.chips{display:flex;gap:8px;overflow:auto;padding:0 0 10px}.chips button{white-space:nowrap;border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--muted);border-radius:999px;padding:9px 12px;font-weight:700}.composer{display:flex;gap:9px;padding:10px 0 88px;border-top:1px solid var(--line)}.composer textarea{flex:1;border:0;outline:none;resize:none;border-radius:18px;padding:14px;background:rgba(255,255,255,.07);color:white}.composer button{width:48px;height:48px;border-radius:18px;border:0;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#171006;display:grid;place-items:center}.stars{display:flex;justify-content:center;gap:6px;margin:16px 0}.star-btn{width:44px;height:44px;border-radius:16px;border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--gold2);display:grid;place-items:center}.star-btn.on{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#171006}.star-btn svg{width:22px;height:22px;fill:currentColor;stroke:currentColor}@media(min-width:760px){body{padding:22px}.app{border-radius:34px;min-height:calc(100dvh - 44px);height:880px}.screen,.chat{min-height:unset;height:880px}.nav{bottom:22px;border-radius:0 0 34px 34px}}
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

const money = (n: number) => `$${Number(n || 0).toLocaleString("es-CL")}`;

function statusIndex(status: string): number {
  return Math.max(0, KITCHEN_STEPS.findIndex((s) => s.key === status));
}

function getCartCount(cart: CartItem[]): number {
  return cart.reduce((s, c) => s + c.qty, 0);
}

function dishPhoto(item: MenuItem): string {
  return photos[item.id] || item.imageUrl || "";
}

// ── Header ────────────────────────────────────────────────────────────────────

function Header({ title = RESTAURANT.name, tableLabel }: { title?: string; tableLabel: string }) {
  return (
    <div className="header">
      <button className="icon">{icons.menu}</button>
      <div className="header-title">{title}</div>
      <div className="pill">{tableLabel}</div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────

function Home({ go, orders, qrCtx }: { go: (t: Tab) => void; orders: Order[]; qrCtx: TableContext }) {
  const active = orders.find((o) => o.status !== "served");
  return (
    <main className="screen fade">
      <section className="hero">
        <div className="topbar">
          <button className="icon">{icons.menu}</button>
          <div className="brand">{RESTAURANT.name}<small>RISTORANTE</small></div>
          <div className="pill">{qrCtx.tableLabel}</div>
        </div>
        <div className="hero-copy">
          <span className="eyebrow">Benvenuto · {qrCtx.zone}</span>
          <h1>Disfruta tu experiencia</h1>
          <p>{RESTAURANT.concept} · {RESTAURANT.city}</p>
        </div>
      </section>

      <div className="action-grid">
        <button className="action" onClick={() => go("menu")}>
          {icons.menu}<h3>Carta</h3><p>Explora el menú y agrega platos.</p>
        </button>
        <button className="action" onClick={() => go("order")}>
          {icons.order}<h3>Estado del pedido</h3>
          <p>{active ? `${active.id} · ${active.etaMinutes ? `${active.etaMinutes} min` : "En cocina"}` : "Sigue cocina en vivo."}</p>
        </button>
        <button className="action" onClick={() => go("waiter")}>
          {icons.bell}<h3>Llamar camarero</h3><p>Ayuda, bebidas o atención rápida.</p>
        </button>
        <button className="action" onClick={() => go("bill")}>
          {icons.bill}<h3>La cuenta</h3><p>Ver consumo y solicitar cobro.</p>
        </button>
        <button className="action" onClick={() => go("feedback")}>
          {icons.star}<h3>Reseña</h3><p>Valora la experiencia.</p>
        </button>
        <button className="action" onClick={() => go("ai")}>
          {icons.spark}<h3>Luca IA</h3><p>Recomendaciones, alergias y dudas.</p>
        </button>
      </div>

      <div className="promo-row">
        {PROMOS.map((p) => (
          <article className="promo glass" key={p.title}>
            <b>{p.eyebrow}</b>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
            <strong>{p.price}</strong>
          </article>
        ))}
      </div>
    </main>
  );
}

// ── Menu ──────────────────────────────────────────────────────────────────────

function MenuScreen({
  items,
  cart,
  openCart,
  addItem,
  tableLabel,
}: {
  items: MenuItem[];
  cart: CartItem[];
  openCart: () => void;
  addItem: (item: MenuItem) => void;
  tableLabel: string;
}) {
  const [cat, setCat] = useState("Todos");
  const [q, setQ] = useState("");

  const cats = useMemo(
    () => ["Todos", ...Array.from(new Set(items.map((d) => d.category)))],
    [items]
  );

  const list = items.filter(
    (d) =>
      (cat === "Todos" || d.category === cat) &&
      (d.name + d.subtitle + d.tags.join(" ")).toLowerCase().includes(q.toLowerCase())
  );

  const subtotal = cart.reduce((s, c) => s + c.item.price * c.qty, 0);
  const count = getCartCount(cart);

  return (
    <main className="screen fade">
      <Header title="Carta" tableLabel={tableLabel} />
      <div className="searchbar">
        <div className="icon">{icons.search}</div>
        <input
          className="searchbox"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar plato, alérgeno o categoría..."
        />
      </div>
      <div className="cat-row">
        {cats.map((c) => (
          <button key={c} className={`cat ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="dish-list">
        {list.map((d) => {
          const inCart = cart.find((c) => c.item.id === d.id);
          const qty = inCart?.qty ?? 0;
          return (
            <article className="dish glass" key={d.id}>
              <div
                className="photo"
                style={{ backgroundImage: dishPhoto(d) ? `url(${dishPhoto(d)})` : undefined }}
              />
              <div>
                <h3>{d.name}</h3>
                <p>{d.subtitle}</p>
                <div className="tags">
                  {d.tags.slice(0, 2).map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
                <div style={{ marginTop: 8, color: "#bfae9d", fontSize: 11 }}>
                  {d.avgPrepMinutes} min · {d.kcal} kcal
                </div>
              </div>
              <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
                <div className="price">{money(d.price)}</div>
                {qty > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "var(--gold2)", fontWeight: 900 }}>{qty}</span>
                    <button className="add" onClick={() => addItem(d)}>{icons.plus}</button>
                  </div>
                ) : (
                  <button className="add" onClick={() => addItem(d)}>{icons.plus}</button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {count > 0 && (
        <button className="floating-cart" onClick={openCart}>
          <span>{count} item{count > 1 ? "s" : ""}</span>
          <span>{money(subtotal)} · Ver pedido</span>
        </button>
      )}
    </main>
  );
}

// ── CartDrawer ────────────────────────────────────────────────────────────────

function CartDrawer({
  open,
  setOpen,
  cart,
  addItem,
  removeItem,
  onSubmit,
  submitting,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  cart: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  onSubmit: (note: string) => void;
  submitting: boolean;
}) {
  const [note, setNote] = useState("");
  const subtotal = cart.reduce((s, c) => s + c.item.price * c.qty, 0);

  return (
    <aside className={`drawer ${open ? "open" : ""}`}>
      <div className="drawer-head">
        <h2>Tu pedido</h2>
        <button className="icon" onClick={() => setOpen(false)}>{icons.x}</button>
      </div>
      <div className="cart-list">
        {cart.length ? (
          cart.map(({ item, qty }) => (
            <div className="cart-item" key={item.id}>
              <div>
                <h4>{item.name}</h4>
                <small>{qty} × {money(item.price)}</small>
              </div>
              <div className="qty">
                <button onClick={() => removeItem(item.id)}>{icons.minus}</button>
                <strong>{qty}</strong>
                <button onClick={() => addItem(item)}>{icons.plus}</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">Aún no agregaste platos.</div>
        )}
      </div>
      {!!cart.length && (
        <>
          <textarea
            className="searchbox glass"
            style={{ width: "100%", color: "white", minHeight: 72, border: "1px solid rgba(255,255,255,.12)" }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notas para cocina: sin cebolla, punto de carne, alergias..."
          />
          <div className="total-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
          <div className="total-row"><span>Servicio sugerido 10%</span><strong>{money(subtotal * 0.1)}</strong></div>
          <div className="total-row strong"><span>Total estimado</span><strong>{money(subtotal * 1.1)}</strong></div>
          <button
            className="btn primary"
            style={{ width: "100%", opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
            onClick={() => { onSubmit(note); setNote(""); }}
          >
            {submitting ? "Enviando a cocina..." : "Enviar a cocina"}
          </button>
        </>
      )}
    </aside>
  );
}

// ── OrderStatus ───────────────────────────────────────────────────────────────

function OrderStatus({ orders, tableLabel }: { orders: Order[]; tableLabel: string }) {
  return (
    <main className="screen fade">
      <Header tableLabel={tableLabel} />
      <div className="section-title">
        <h2>Estado del pedido</h2>
        <span>Live kitchen</span>
      </div>
      {orders.length ? (
        orders.map((o) => (
          <article key={o.id} className="status-card glass">
            <div className="status-head">
              <div>
                <h3>{o.id.startsWith("optimistic") ? "Nuevo pedido" : o.id}</h3>
                <small>{new Date(o.createdAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</small>
              </div>
              <div className="eta">
                {o.status === "served" ? "Listo" : o.etaMinutes ? `${o.etaMinutes} min` : "En cocina"}
              </div>
            </div>
            <div className="steps">
              {KITCHEN_STEPS.map((s, i) => (
                <span key={s.key} className={`step ${i <= statusIndex(o.status) ? "on" : ""}`} />
              ))}
            </div>
            <div className="order-lines">
              {KITCHEN_STEPS.map((s, i) => (
                <div key={s.key} style={{ opacity: i <= statusIndex(o.status) ? 1 : 0.38 }}>
                  ● {s.label}
                </div>
              ))}
              <br />
              {o.items.map(({ item, qty }) => (
                <div key={item.id}>{qty}× {item.name}</div>
              ))}
            </div>
          </article>
        ))
      ) : (
        <div className="empty glass">No hay pedidos activos.</div>
      )}
    </main>
  );
}

// ── Waiter ────────────────────────────────────────────────────────────────────

function Waiter({
  pending,
  calling,
  tableLabel,
  onCall,
}: {
  pending: boolean;
  calling: boolean;
  tableLabel: string;
  onCall: (reason: string) => void;
}) {
  return (
    <main className="screen fade">
      <Header tableLabel={tableLabel} />
      <section className="waiter-hero glass">
        <h2 style={{ margin: 0, fontSize: 28, letterSpacing: "-.06em" }}>Atención en mesa</h2>
        <p style={{ color: "#bfae9d" }}>Notifica al camarero sin levantar la mano.</p>
        <button
          className={`bell-big ${pending || calling ? "active" : ""}`}
          onClick={() => onCall("Atención solicitada")}
        >
          {icons.bell}
        </button>
        <strong>
          {calling ? "Enviando aviso..." : pending ? "Camarero notificado" : "Tocar para llamar"}
        </strong>
      </section>
      <div className="quick-list">
        {WAITER_REASONS.map((r) => (
          <button className="quick" key={r} onClick={() => onCall(r)}>
            <span>{r}</span><span>→</span>
          </button>
        ))}
      </div>
    </main>
  );
}

// ── Bill ──────────────────────────────────────────────────────────────────────

function Bill({
  orders,
  tableLabel,
  qrCtx,
  onRequest,
  requesting,
  requested,
}: {
  orders: Order[];
  tableLabel: string;
  qrCtx: TableContext;
  onRequest: () => void;
  requesting: boolean;
  requested: boolean;
}) {
  const allItems = orders.flatMap((o) => o.items);
  const grouped = allItems.reduce<Record<string, { item: MenuItem; qty: number }>>((acc, { item, qty }) => ({
    ...acc,
    [item.id]: { item, qty: (acc[item.id]?.qty || 0) + qty },
  }), {});
  const subtotal = Object.values(grouped).reduce((s, { item, qty }) => s + item.price * qty, 0);
  const tip = Math.round(subtotal * 0.1);
  const total = subtotal + tip;

  return (
    <main className="screen fade">
      <Header tableLabel={tableLabel} />
      <div className="section-title">
        <h2>Cuenta</h2>
        <span>{qrCtx.tableLabel}</span>
      </div>
      <section className="bill-card glass">
        {Object.values(grouped).length ? (
          Object.values(grouped).map(({ item, qty }) => (
            <div className="bill-line" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <small>{qty} × {money(item.price)}</small>
              </div>
              <strong>{money(qty * item.price)}</strong>
            </div>
          ))
        ) : (
          <div className="empty">Sin consumo registrado todavía.</div>
        )}
        <div className="total-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
        <div className="total-row"><span>Servicio sugerido 10%</span><strong>{money(tip)}</strong></div>
        <div className="total-row strong"><span>Total</span><strong>{money(total)}</strong></div>
        {requested ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <strong style={{ color: "var(--green)" }}>✓ Cuenta solicitada</strong>
            <p style={{ color: "#bfae9d", fontSize: 13, marginTop: 6 }}>El camarero irá a la mesa para el cobro.</p>
          </div>
        ) : (
          <button
            disabled={!subtotal || requesting}
            className="btn primary"
            style={{ width: "100%", opacity: !subtotal ? 0.45 : 1 }}
            onClick={onRequest}
          >
            {requesting ? "Solicitando camarero..." : "Solicitar cobro"}
          </button>
        )}
        <p style={{ color: "#bfae9d", fontSize: 12, lineHeight: 1.5, margin: "12px 0 0" }}>
          El cobro siempre lo realiza el camarero en la mesa.
        </p>
      </section>
    </main>
  );
}

// ── Feedback ──────────────────────────────────────────────────────────────────

function Feedback({
  tableLabel,
  qrCtx,
  onSubmit,
  submitting,
  submitted,
}: {
  tableLabel: string;
  qrCtx: TableContext;
  onSubmit: (rating: number, comment: string) => void;
  submitting: boolean;
  submitted: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (submitted) {
    return (
      <main className="screen fade">
        <Header title="Reseña" tableLabel={tableLabel} />
        <section className="review-card glass" style={{ textAlign: "center" }}>
          <p style={{ fontSize: 40, margin: "20px 0" }}>⭐</p>
          <strong style={{ color: "var(--gold2)", fontSize: 18 }}>¡Gracias por tu valoración!</strong>
          <p style={{ color: "#bfae9d", marginTop: 8 }}>Nos ayuda a mejorar cada día.</p>
          <button
            className="btn ghost"
            style={{ width: "100%", marginTop: 16 }}
            onClick={() => window.open(RESTAURANT.googleReviewUrl, "_blank")}
          >
            Dejar reseña en Google ↗
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="screen fade">
      <Header title="Reseña" tableLabel={tableLabel} />
      <section className="review-card glass">
        <div className="section-title" style={{ display: "block", textAlign: "center", margin: 0 }}>
          <h2>¿Qué tal estuvo?</h2>
          <span>Tu opinión ayuda al restaurante a mejorar.</span>
        </div>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className={`star-btn ${n <= rating ? "on" : ""}`} onClick={() => setRating(n)}>
              {icons.star}
            </button>
          ))}
        </div>
        <textarea
          className="searchbox glass"
          style={{ width: "100%", color: "white", minHeight: 96, border: "1px solid rgba(255,255,255,.12)" }}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comentario opcional para el restaurante..."
        />
        <button
          className="btn primary"
          style={{ width: "100%", marginTop: 12, opacity: submitting ? 0.7 : 1 }}
          disabled={submitting}
          onClick={() => onSubmit(rating, comment)}
        >
          {submitting ? "Enviando..." : "Enviar valoración"}
        </button>
        <button
          className="btn ghost"
          style={{ width: "100%", marginTop: 10 }}
          onClick={() => window.open(RESTAURANT.googleReviewUrl, "_blank")}
        >
          Dejar reseña en Google
        </button>
      </section>
    </main>
  );
}

// ── Assistant (Luca) ──────────────────────────────────────────────────────────

interface AiMsg { role: "ai" | "user"; text: string }

async function callLuka(
  message: string,
  ctx: { tableId: number; sessionId: string; qrToken: string; restaurantId: string } | null
): Promise<string> {
  try {
    const res = await fetch("/api/luka", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        table_id: ctx?.tableId ?? null,
        session_id: ctx?.sessionId ?? "",
        qr_token: ctx?.qrToken ?? "",
        user_role: "cliente",
        restaurant_id: ctx?.restaurantId ?? "nido",
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = await res.json() as { reply?: string; ok?: boolean };
    return data.reply ?? "No pude responder. Intenta de nuevo.";
  } catch {
    return "Sin conexión con Luka. Intenta de nuevo.";
  }
}

function Assistant({
  tableCtx,
  go,
  callWaiter,
}: {
  tableCtx: { tableId: number; sessionId: string; qrToken: string; restaurantId: string } | null;
  go: (t: Tab) => void;
  callWaiter: (r: string) => void;
}) {
  const [msgs, setMsgs] = useState<AiMsg[]>([
    { role: "ai", text: "Soy Luka, tu asistente en NIDO. Puedo recomendarte platos, llamar al camarero, o pedir la cuenta. ¿En qué te ayudo?" },
  ]);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = useCallback(async (value = text) => {
    const q = value.trim();
    if (!q || thinking) return;
    setText("");
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setThinking(true);
    const reply = await callLuka(q, tableCtx);
    setThinking(false);
    // Client-side shortcuts: if Luka mentions navigating, do it
    if (/cuenta|cobro/i.test(reply) && /tab|naveg|llevo/i.test(reply)) setTimeout(() => go("bill"), 400);
    if (/pedido|cocina/i.test(reply) && /tab|naveg|llevo/i.test(reply)) setTimeout(() => go("order"), 400);
    setMsgs((m) => [...m, { role: "ai", text: reply }]);
  }, [text, thinking, tableCtx, go]);

  const chips = ["¿Qué recomiendas?", "¿Hay sin gluten?", "Ver mi pedido", "Pedir la cuenta", "Llamar camarero"];

  return (
    <main className="chat fade">
      <div className="messages">
        {msgs.map((m, i) => <div key={i} className={`msg ${m.role}`}>{m.text}</div>)}
        {thinking && <div className="msg ai" style={{ opacity: 0.5 }}>Luka está pensando…</div>}
        <div ref={endRef} />
      </div>
      <div className="chips">
        {chips.map((c) => <button key={c} onClick={() => send(c)} disabled={thinking}>{c}</button>)}
      </div>
      <div className="composer">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
          placeholder="Pregúntale a Luka..."
          disabled={thinking}
        />
        <button onClick={() => void send()} disabled={thinking}>{icons.send}</button>
      </div>
    </main>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav({ tab, setTab, cartCount: count }: { tab: Tab; setTab: (t: Tab) => void; cartCount: number }) {
  const items: [Tab, string, React.ReactElement][] = [
    ["home", "Inicio", icons.home],
    ["menu", "Carta", icons.menu],
    ["order", "Pedido", icons.order],
    ["waiter", "Camarero", icons.bell],
    ["bill", "Cuenta", icons.bill],
  ];
  return (
    <nav className="nav">
      {items.map(([id, label, icon]) => (
        <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
          {id === "menu" && count > 0 && <span className="cart-badge">{count}</span>}
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function GastroMesa({ qrToken }: { qrToken: string }) {
  const session = useTableSession(qrToken);
  const [tab, setTab] = useState<Tab>("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [callingWaiter, setCallingWaiter] = useState(false);
  const [requestingBill, setRequestingBill] = useState(false);
  const [billRequested, setBillRequested] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const cartCount = useMemo(() => getCartCount(session.cart), [session.cart]);

  const handleSubmitOrder = useCallback(async (note: string) => {
    if (!session.tableCtx) return;
    setSubmittingOrder(true);
    await session.submitOrder(session.cart, note, session.tableCtx);
    setSubmittingOrder(false);
    setCartOpen(false);
    setTab("order");
  }, [session]);

  const handleCallWaiter = useCallback(async (reason: string) => {
    if (!session.tableCtx) return;
    setCallingWaiter(true);
    await session.callWaiter(reason, session.tableCtx);
    setCallingWaiter(false);
  }, [session]);

  const handleRequestBill = useCallback(async () => {
    if (!session.tableCtx) return;
    setRequestingBill(true);
    const total = session.orders.reduce((s, o) => s + o.total, 0);
    const result = await session.requestBill(total, session.tableCtx);
    setRequestingBill(false);
    if (result.ok) setBillRequested(true);
  }, [session]);

  const handleSendFeedback = useCallback(async (rating: number, comment: string) => {
    if (!session.tableCtx) return;
    setSubmittingFeedback(true);
    const result = await session.sendFeedback(rating, comment, session.tableCtx);
    setSubmittingFeedback(false);
    if (result.ok) setFeedbackSubmitted(true);
  }, [session]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (session.loading) {
    return (
      <div className="app">
        <style>{CSS}</style>
        <main className="screen fade">
          <section className="hero">
            <div className="brand">{RESTAURANT.name}<small>RISTORANTE</small></div>
            <div className="hero-copy">
              <span className="eyebrow">Validando QR</span>
              <h1>Preparando tu mesa</h1>
              <p>Un momento...</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ── Error / QR inválido ────────────────────────────────────────────────────
  if (session.error || !session.tableCtx) {
    return (
      <div className="app">
        <style>{CSS}</style>
        <main className="screen fade">
          <section className="hero">
            <div className="brand">{RESTAURANT.name}<small>RISTORANTE</small></div>
            <div className="hero-copy">
              <span className="eyebrow">QR no disponible</span>
              <h1>Solicita ayuda</h1>
              <p>Este código no está activo. Por favor avisa al camarero.</p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const { tableCtx } = session;

  return (
    <div className="app">
      <style>{CSS}</style>

      {tab === "home" && <Home go={setTab} orders={session.orders} qrCtx={tableCtx} />}
      {tab === "menu" && (
        <MenuScreen
          items={session.menuItems}
          cart={session.cart}
          openCart={() => setCartOpen(true)}
          addItem={session.addItem}
          tableLabel={tableCtx.tableLabel}
        />
      )}
      {tab === "order" && <OrderStatus orders={session.orders} tableLabel={tableCtx.tableLabel} />}
      {tab === "waiter" && (
        <Waiter
          pending={session.waiterCall.pending}
          calling={callingWaiter}
          tableLabel={tableCtx.tableLabel}
          onCall={handleCallWaiter}
        />
      )}
      {tab === "bill" && (
        <Bill
          orders={session.orders}
          tableLabel={tableCtx.tableLabel}
          qrCtx={tableCtx}
          onRequest={handleRequestBill}
          requesting={requestingBill}
          requested={billRequested}
        />
      )}
      {tab === "feedback" && (
        <Feedback
          tableLabel={tableCtx.tableLabel}
          qrCtx={tableCtx}
          onSubmit={handleSendFeedback}
          submitting={submittingFeedback}
          submitted={feedbackSubmitted}
        />
      )}
      {tab === "ai" && (
        <Assistant
          tableCtx={tableCtx}
          go={setTab}
          callWaiter={(r) => void handleCallWaiter(r)}
        />
      )}

      {/* Floating AI button */}
      <button
        className="btn primary"
        style={{ position: "fixed", right: 16, bottom: 92, zIndex: 22, width: 54, height: 54, borderRadius: 20, padding: 0 }}
        onClick={() => setTab("ai")}
      >
        {icons.spark}
      </button>

      <CartDrawer
        open={cartOpen}
        setOpen={setCartOpen}
        cart={session.cart}
        addItem={session.addItem}
        removeItem={session.removeItem}
        onSubmit={handleSubmitOrder}
        submitting={submittingOrder}
      />

      <Nav tab={tab} setTab={setTab} cartCount={cartCount} />
    </div>
  );
}
