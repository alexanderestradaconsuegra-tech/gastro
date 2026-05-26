"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTableSession } from "@/hooks/useTableSession";
import type { CartItem, Order } from "@/hooks/useTableSession";
import type { MenuItem } from "@/lib/constants";

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;600;700;800;900&display=swap');
:root{
  --bg:#060504;--gold:#d9a441;--gold2:#f7d37b;--text:#fff7ed;--muted:#bcae9f;
  --dim:#7d7064;--line:rgba(255,255,255,.09);--green:#34d399;--red:#ef4444;
  --shadow:0 24px 80px rgba(0,0,0,.5);
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif;overscroll-behavior:none;height:100%}
.kiosk{min-height:100dvh;display:flex;flex-direction:column;max-width:600px;margin:0 auto;position:relative;overflow:hidden}

/* ── Idle ── */
.idle{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;background:radial-gradient(circle at 50% -10%,rgba(217,164,65,.28),transparent 55%),radial-gradient(circle at 110% 100%,rgba(126,58,242,.14),transparent 45%),var(--bg)}
.idle-brand{font-family:'Playfair Display',serif;font-size:52px;letter-spacing:.18em;color:var(--gold2);line-height:1}
.idle-brand small{display:block;font-family:Inter;font-size:13px;letter-spacing:.4em;color:var(--muted);margin-top:10px;font-weight:600}
.idle-ring{width:200px;height:200px;border-radius:50%;border:2px solid rgba(217,164,65,.3);background:radial-gradient(circle,rgba(217,164,65,.18),transparent);display:grid;place-items:center;margin:36px auto;animation:breathe 3s ease-in-out infinite}
@keyframes breathe{0%,100%{box-shadow:0 0 0 0 rgba(217,164,65,.22),0 0 60px rgba(217,164,65,.08)}50%{box-shadow:0 0 0 28px rgba(217,164,65,.04),0 0 100px rgba(217,164,65,.16)}}
.idle-ring svg{width:72px;height:72px;fill:none;stroke:var(--gold2);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.idle-cta{font-family:'Playfair Display',serif;font-size:28px;margin:0 0 10px;letter-spacing:-.02em}
.idle-sub{color:var(--muted);margin:0 0 40px;font-size:15px}
.idle-btn{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#171006;border:0;border-radius:24px;padding:22px 52px;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 16px 48px rgba(217,164,65,.32);letter-spacing:.02em;transition:.15s transform}
.idle-btn:active{transform:scale(.97)}

/* ── Top bar ── */
.topbar{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--line);background:rgba(6,5,4,.9);backdrop-filter:blur(20px);position:sticky;top:0;z-index:30}
.topbar-brand{font-family:'Playfair Display',serif;font-size:22px;letter-spacing:.12em;color:var(--gold2)}
.topbar-meta{font-size:12px;color:var(--muted);font-weight:700;text-align:right}
.cart-pill{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#171006;border:0;border-radius:999px;padding:10px 18px;font-weight:900;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:8px;transition:.15s transform}
.cart-pill:active{transform:scale(.96)}
.cart-pill svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}

/* ── Menu ── */
.menu-screen{flex:1;overflow:auto;padding-bottom:24px}
.cat-bar{display:flex;gap:10px;overflow-x:auto;padding:16px 20px 0;scrollbar-width:none}
.cat-bar::-webkit-scrollbar{display:none}
.cat-btn{white-space:nowrap;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--muted);border-radius:999px;padding:12px 18px;font-weight:800;font-size:13px;cursor:pointer;transition:.15s background}
.cat-btn.on{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#161006;border-color:transparent}
.dish-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:16px 20px}
.dish-card{border-radius:22px;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));border:1px solid var(--line);overflow:hidden;display:flex;flex-direction:column}
.dish-photo{height:140px;background-size:cover;background-position:center;background-image:linear-gradient(135deg,#2a1e14,#0f0d0b)}
.dish-body{padding:14px;flex:1;display:flex;flex-direction:column;gap:6px}
.dish-name{font-weight:800;font-size:15px;line-height:1.25}
.dish-sub{color:var(--muted);font-size:11px;line-height:1.35;flex:1}
.dish-footer{display:flex;justify-content:space-between;align-items:center;margin-top:6px}
.dish-price{color:var(--gold2);font-weight:900;font-size:15px}
.add-btn{width:42px;height:42px;border-radius:14px;border:1px solid rgba(217,164,65,.5);background:rgba(217,164,65,.1);color:var(--gold2);display:grid;place-items:center;cursor:pointer;transition:.15s background;flex-shrink:0}
.add-btn:active{background:rgba(217,164,65,.25)}
.add-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.qty-ctrl{display:flex;align-items:center;gap:8px}
.qty-ctrl button{width:38px;height:38px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.07);color:var(--text);display:grid;place-items:center;cursor:pointer;font-size:18px;font-weight:700}
.qty-ctrl button:active{background:rgba(255,255,255,.14)}
.qty-val{color:var(--gold2);font-weight:900;font-size:16px;min-width:22px;text-align:center}
.tag-row{display:flex;gap:5px;flex-wrap:wrap;margin-top:2px}
.tag{font-size:9px;font-weight:900;color:#201405;background:rgba(247,211,123,.88);border-radius:999px;padding:3px 7px}
.prep{font-size:10px;color:var(--dim);margin-top:2px}

/* ── Cart drawer ── */
.drawer{position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;justify-content:flex-end}
.drawer-bg{position:absolute;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px)}
.drawer-sheet{position:relative;background:#0f0d0a;border-radius:28px 28px 0 0;border-top:1px solid var(--line);padding:22px 22px 32px;max-height:88dvh;overflow-y:auto;box-shadow:0 -30px 80px rgba(0,0,0,.7)}
.drawer-handle{width:40px;height:4px;border-radius:999px;background:rgba(255,255,255,.15);margin:0 auto 18px}
.drawer-title{font-family:'Playfair Display',serif;font-size:28px;margin:0 0 16px;letter-spacing:-.03em}
.cart-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}
.ci-photo{width:64px;height:64px;border-radius:14px;background-size:cover;background-position:center;background-image:linear-gradient(135deg,#2a1e14,#0f0d0b);flex-shrink:0}
.ci-info{flex:1;min-width:0}
.ci-info b{display:block;font-size:14px;font-weight:800}
.ci-info span{color:var(--gold2);font-weight:700;font-size:13px}
.ci-qty{display:flex;align-items:center;gap:10px}
.ci-qty button{width:36px;height:36px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.07);color:white;display:grid;place-items:center;font-size:17px;font-weight:700;cursor:pointer}
.ci-qty span{font-weight:900;color:var(--gold2);min-width:22px;text-align:center}
.cart-total{display:flex;justify-content:space-between;padding:14px 0;font-size:18px;font-weight:800;border-top:1px solid var(--line);margin-top:4px}
.cart-total b{color:var(--gold2)}
.notes-label{display:block;font-size:12px;font-weight:800;color:var(--muted);margin:12px 0 6px}
.notes-input{width:100%;border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--text);border-radius:14px;padding:12px;font:inherit;resize:none;outline:none;font-size:14px}
.submit-btn{width:100%;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#171006;border:0;border-radius:20px;padding:20px;font-size:18px;font-weight:900;cursor:pointer;margin-top:14px;box-shadow:0 12px 36px rgba(217,164,65,.28);transition:.15s transform}
.submit-btn:active{transform:scale(.98)}
.submit-btn:disabled{opacity:.5;cursor:not-allowed}

/* ── Confirmation ── */
.confirm-screen{min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;background:radial-gradient(circle at 50% 30%,rgba(52,211,153,.18),transparent 55%),var(--bg)}
.confirm-icon{width:110px;height:110px;border-radius:50%;background:rgba(52,211,153,.15);border:2px solid rgba(52,211,153,.4);display:grid;place-items:center;margin:0 auto 24px;animation:pop .4s cubic-bezier(.2,1.3,.4,1) both}
@keyframes pop{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}
.confirm-icon svg{width:52px;height:52px;fill:none;stroke:var(--green);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.confirm-title{font-family:'Playfair Display',serif;font-size:34px;margin:0 0 10px;letter-spacing:-.03em}
.confirm-sub{color:var(--muted);font-size:16px;margin:0 0 28px}
.confirm-order{background:rgba(255,255,255,.06);border:1px solid var(--line);border-radius:20px;padding:18px 24px;margin-bottom:28px;font-size:20px;font-weight:900;letter-spacing:.08em;color:var(--gold2)}
.confirm-summary{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:18px;padding:14px 18px;margin-bottom:24px;text-align:left}
.confirm-row{display:flex;justify-content:space-between;font-size:13px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.confirm-row:last-child{border-bottom:none;font-weight:800;color:var(--gold2);font-size:15px;margin-top:4px}
.reset-bar{width:100%;height:5px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:8px}
.reset-bar-fill{height:100%;background:var(--gold2);transition:width 1s linear;border-radius:999px}
.reset-hint{color:var(--dim);font-size:12px;margin-top:8px}
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function money(n: number) {
  return `$${Number(n || 0).toLocaleString("es-CL")}`;
}

function dishPhoto(item: MenuItem): string {
  return item.imageUrl ?? "";
}

const PLUS = <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>;
const MINUS = <svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>;
const CART_ICON = <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>;
const CHECK = <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>;
const CUTLERY = <svg viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6h3v7"/></svg>;

const RESET_SECONDS = 10;

// ── IdleScreen ────────────────────────────────────────────────────────────────

function IdleScreen({ restaurantName, tableLabel, onStart }: {
  restaurantName: string;
  tableLabel: string;
  onStart: () => void;
}) {
  return (
    <div className="idle" onClick={onStart}>
      <div className="idle-brand">
        {restaurantName}<small>AUTOSERVICIO</small>
      </div>
      <div className="idle-ring">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://assets.zyrosite.com/rvH9B7W9kUvvSHwW/chatgpt-image-26-may-2026-16_54_36-4RwvXLTvZr1xrvQL.png" alt="HOLU" style={{ width: 150, height: 150, objectFit: "contain", borderRadius: "50%" }} />
      </div>
      <p className="idle-cta">¡Bienvenido!</p>
      <p className="idle-sub">{tableLabel} · Toca para comenzar tu pedido</p>
      <button className="idle-btn" onClick={(e) => { e.stopPropagation(); onStart(); }}>
        Comenzar pedido
      </button>
    </div>
  );
}

// ── DishCard ──────────────────────────────────────────────────────────────────

function DishCard({ item, qty, onAdd, onRemove }: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const photo = dishPhoto(item);
  return (
    <div className="dish-card">
      <div className="dish-photo" style={photo ? { backgroundImage: `url(${photo})` } : undefined} />
      <div className="dish-body">
        <div className="dish-name">{item.name}</div>
        <div className="dish-sub">{item.subtitle}</div>
        {item.tags.length > 0 && (
          <div className="tag-row">{item.tags.slice(0, 2).map((t) => <span key={t} className="tag">{t}</span>)}</div>
        )}
        <div className="prep">{item.avgPrepMinutes} min · {item.kcal} kcal</div>
        <div className="dish-footer">
          <span className="dish-price">{money(item.price)}</span>
          {qty === 0 ? (
            <button className="add-btn" onClick={onAdd}>{PLUS}</button>
          ) : (
            <div className="qty-ctrl">
              <button onClick={onRemove}>−</button>
              <span className="qty-val">{qty}</span>
              <button onClick={onAdd}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CartDrawer ────────────────────────────────────────────────────────────────

function CartDrawer({ cart, addItem, removeItem, onClose, onSubmit, submitting, tableLabel }: {
  cart: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  onClose: () => void;
  onSubmit: (note: string) => void;
  submitting: boolean;
  tableLabel: string;
}) {
  const [notes, setNotes] = useState("");
  const subtotal = cart.reduce((s, c) => s + c.item.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <div className="drawer">
      <div className="drawer-bg" onClick={onClose} />
      <div className="drawer-sheet">
        <div className="drawer-handle" />
        <h2 className="drawer-title">Tu pedido · {tableLabel}</h2>
        {cart.map(({ item, qty }) => (
          <div key={item.id} className="cart-item">
            <div className="ci-photo" style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined} />
            <div className="ci-info">
              <b>{item.name}</b>
              <span>{money(item.price * qty)}</span>
            </div>
            <div className="ci-qty">
              <button onClick={() => removeItem(item.id)}>−</button>
              <span>{qty}</span>
              <button onClick={() => addItem(item)}>+</button>
            </div>
          </div>
        ))}
        <div className="cart-total">
          <span>{count} plato{count !== 1 ? "s" : ""}</span>
          <b>{money(subtotal)}</b>
        </div>
        <label className="notes-label">Notas (alergias, sin cebolla…)</label>
        <textarea
          className="notes-input"
          rows={2}
          placeholder="Escribe aquí cualquier indicación especial…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button className="submit-btn" onClick={() => onSubmit(notes)} disabled={submitting || cart.length === 0}>
          {submitting ? "Enviando a cocina…" : `Confirmar pedido · ${money(subtotal)}`}
        </button>
      </div>
    </div>
  );
}

// ── ConfirmScreen ─────────────────────────────────────────────────────────────

function ConfirmScreen({ order, tableLabel, onReset }: {
  order: Order;
  tableLabel: string;
  onReset: () => void;
}) {
  const [progress, setProgress] = useState(100);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const remaining = useRef(RESET_SECONDS);

  useEffect(() => {
    tick.current = setInterval(() => {
      remaining.current -= 1;
      setProgress((remaining.current / RESET_SECONDS) * 100);
      if (remaining.current <= 0) {
        clearInterval(tick.current!);
        onReset();
      }
    }, 1000);
    return () => clearInterval(tick.current!);
  }, [onReset]);

  const total = order.items.reduce((s, c) => s + (c.item?.price ?? 0) * c.qty, 0);

  return (
    <div className="confirm-screen">
      <div className="confirm-icon">{CHECK}</div>
      <h2 className="confirm-title">¡Pedido enviado!</h2>
      <p className="confirm-sub">Cocina ya está preparando tu pedido · {tableLabel}</p>
      <div className="confirm-order">{order.id}</div>
      {order.items.length > 0 && (
        <div className="confirm-summary">
          {order.items.map((ci, i) => (
            <div key={i} className="confirm-row">
              <span>{ci.qty}× {ci.item?.name ?? "Plato"}</span>
              <span>{money((ci.item?.price ?? 0) * ci.qty)}</span>
            </div>
          ))}
          <div className="confirm-row"><span>Total</span><span>{money(total)}</span></div>
        </div>
      )}
      <div className="reset-bar">
        <div className="reset-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="reset-hint">Volviendo a inicio en {Math.ceil(progress / (100 / RESET_SECONDS))} seg…</p>
    </div>
  );
}

// ── MenuScreen ────────────────────────────────────────────────────────────────

function MenuScreen({ session, tableLabel, restaurantName, onCartOpen, onReset }: {
  session: ReturnType<typeof useTableSession>;
  tableLabel: string;
  restaurantName: string;
  onCartOpen: () => void;
  onReset: () => void;
}) {
  const [cat, setCat] = useState("Todo");
  const items = session.menuItems;
  const cart = session.cart;

  const categories = useMemo(
    () => ["Todo", ...Array.from(new Set(items.map((d) => d.category)))],
    [items]
  );
  const visible = items.filter(
    (d) => d.stockStatus !== "out" && (cat === "Todo" || d.category === cat)
  );
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.item.price * c.qty, 0);

  const qty = useCallback(
    (id: string) => cart.find((c) => c.item.id === id)?.qty ?? 0,
    [cart]
  );

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-brand">{restaurantName}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="topbar-meta">{tableLabel}</div>
          {cartCount > 0 ? (
            <button className="cart-pill" onClick={onCartOpen}>
              {CART_ICON} {cartCount} · {money(cartTotal)}
            </button>
          ) : (
            <button
              style={{ border: "1px solid var(--line)", background: "transparent", color: "var(--muted)", borderRadius: 12, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}
              onClick={onReset}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
      <div className="menu-screen">
        <div className="cat-bar">
          {categories.map((c) => (
            <button key={c} className={`cat-btn ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="dish-grid">
          {visible.map((item) => (
            <DishCard
              key={item.id}
              item={item}
              qty={qty(item.id)}
              onAdd={() => session.addItem(item)}
              onRemove={() => session.removeItem(item.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// ── GastroKiosk ───────────────────────────────────────────────────────────────

export default function GastroKiosk({ qrToken }: { qrToken: string }) {
  const session = useTableSession(qrToken);
  const [screen, setScreen] = useState<"idle" | "menu" | "confirm">("idle");
  const [cartOpen, setCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Inactivity reset: 90s without interaction returns to idle
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetInactivity = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setScreen("idle");
      setCartOpen(false);
    }, 90_000);
  }, []);

  useEffect(() => {
    if (screen !== "menu") return;
    resetInactivity();
    const events = ["pointerdown", "pointermove", "keydown"];
    events.forEach((e) => window.addEventListener(e, resetInactivity, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetInactivity));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [screen, resetInactivity]);

  const handleStart = useCallback(() => setScreen("menu"), []);

  const handleReset = useCallback(() => {
    setScreen("idle");
    setCartOpen(false);
    setConfirmedOrder(null);
    setSubmitting(false);
  }, []);

  const handleSubmit = useCallback(async (note: string) => {
    if (submitting || session.cart.length === 0 || !session.tableCtx) return;
    setSubmitting(true);
    const cartSnapshot = [...session.cart];
    const result = await session.submitOrder(cartSnapshot, note, session.tableCtx);
    setSubmitting(false);
    if (result.ok) {
      const fakeOrder: Order = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "received",
        etaMinutes: null,
        items: cartSnapshot,
        note,
        total: cartSnapshot.reduce((s, c) => s + c.item.price * c.qty, 0),
        createdAt: new Date().toISOString(),
      };
      setConfirmedOrder(fakeOrder);
      setCartOpen(false);
      setScreen("confirm");
    }
  }, [submitting, session]);

  const { tableCtx } = session;
  const tableLabel = tableCtx?.tableLabel ?? "Kiosko";
  const restaurantName = "HOLU";

  // Invalid / no QR
  if (!session.loading && !tableCtx && qrToken) {
    return (
      <div className="kiosk">
        <style>{CSS}</style>
        <div className="idle" style={{ gap: 16 }}>
          <div className="idle-brand">{restaurantName}<small>AUTOSERVICIO</small></div>
          <p style={{ color: "var(--muted)", margin: 0 }}>Este kiosko no está configurado. Avisa al personal.</p>
        </div>
      </div>
    );
  }

  if (!qrToken) {
    return (
      <div className="kiosk">
        <style>{CSS}</style>
        <div className="idle">
          <div className="idle-brand">{restaurantName}<small>AUTOSERVICIO</small></div>
          <p style={{ color: "var(--muted)", marginTop: 24 }}>
            Accede con <code style={{ color: "var(--gold2)" }}>/kiosk?qr=TOKEN</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk">
      <style>{CSS}</style>

      {screen === "idle" && (
        <IdleScreen
          restaurantName={restaurantName}
          tableLabel={tableLabel}
          onStart={handleStart}
        />
      )}

      {screen === "menu" && (
        <MenuScreen
          session={session}
          tableLabel={tableLabel}
          restaurantName={restaurantName}
          onCartOpen={() => setCartOpen(true)}
          onReset={handleReset}
        />
      )}

      {screen === "confirm" && confirmedOrder && (
        <ConfirmScreen
          order={confirmedOrder}
          tableLabel={tableLabel}
          onReset={handleReset}
        />
      )}

      {cartOpen && screen === "menu" && (
        <CartDrawer
          cart={session.cart}
          addItem={session.addItem}
          removeItem={session.removeItem}
          onClose={() => setCartOpen(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
          tableLabel={tableLabel}
        />
      )}
    </div>
  );
}
