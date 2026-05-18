"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTableSession } from "@/hooks/useTableSession";
import {
  CATEGORIES,
  PROMOS,
  KITCHEN_STEPS,
  WAITER_REASONS,
  AI_QUICK_QUESTIONS,
  RESTAURANT_NAME,
  money,
  statusIndex,
  type MenuItem,
  type KitchenStatus,
} from "@/lib/constants";
import type { CartItem, Order, TableContext } from "@/hooks/useTableSession";

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = "home" | "menu" | "order" | "waiter" | "bill" | "feedback" | "ai";

interface AiMessage {
  role: "user" | "assistant";
  text: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function cartTotal(cart: CartItem[]): number {
  return cart.reduce((s, c) => s + c.item.price * c.qty, 0);
}

function cartCount(cart: CartItem[]): number {
  return cart.reduce((s, c) => s + c.qty, 0);
}

function ordersTotal(orders: Order[]): number {
  return orders.reduce((s, o) => s + o.total, 0);
}

// ── AI response generator (local, no LLM call) ───────────────────────────────

function aiReply(question: string, menuItems: MenuItem[]): string {
  const q = question.toLowerCase();
  if (q.includes("gluten")) {
    const sf = menuItems.filter((m) => m.tags.includes("sin gluten"));
    return sf.length
      ? `Sin gluten: ${sf.map((m) => m.name).join(", ")}.`
      : "No tenemos platos sin gluten identificados actualmente.";
  }
  if (q.includes("vegetariano")) {
    const veg = menuItems.filter((m) => m.tags.includes("vegetariano"));
    return veg.length
      ? `Opciones vegetarianas: ${veg.map((m) => m.name).join(", ")}.`
      : "No hay opciones vegetarianas identificadas hoy.";
  }
  if (q.includes("ossobuco")) {
    const item = menuItems.find((m) => m.id === "ossobuco");
    return item
      ? `${item.name}: ${item.description} Alérgenos: ${item.allergens.join(", ")}.`
      : "El Ossobuco no está disponible hoy.";
  }
  if (q.includes("pasta") || q.includes("tarda")) {
    const pasta = menuItems.filter((m) => m.category === "Pasta");
    return pasta.length
      ? `La pasta tarda entre ${Math.min(...pasta.map((m) => m.avgPrepMinutes))}–${Math.max(...pasta.map((m) => m.avgPrepMinutes))} minutos.`
      : "Los tiempos de pasta varían. Pregunta a tu camarero.";
  }
  if (q.includes("vino") || q.includes("recomiend")) {
    const pairs = menuItems.filter((m) => m.winePair);
    return pairs.length
      ? `Maridajes del chef: ${pairs.map((m) => `${m.name} → ${m.winePair}`).join("; ")}.`
      : "Consulta con nuestro sommelier para recomendaciones de vino.";
  }
  if (q.includes("camarero") || q.includes("llama")) {
    return "Para llamar al camarero ve a la pestaña 🔔 Camarero en el menú inferior.";
  }
  if (q.includes("pagar") || q.includes("cuenta")) {
    return "Para solicitar la cuenta ve a la pestaña 💳 Cuenta en el menú inferior.";
  }
  if (q.includes("alergi")) {
    return "Los alérgenos están indicados en cada plato. Si tienes dudas avisa a tu camarero antes de pedir.";
  }
  return "No tengo esa información. Puedo ayudarte con el menú, alérgenos, tiempos de cocina o llamar al camarero.";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Header({ tab, tableLabel }: { tab: Tab; tableLabel: string }) {
  const titles: Record<Tab, string> = {
    home: RESTAURANT_NAME,
    menu: "Carta",
    order: "Mi pedido",
    waiter: "Camarero",
    bill: "Cuenta",
    feedback: "Opinión",
    ai: "Luca IA",
  };
  return (
    <header style={hdr.root}>
      <span style={hdr.title}>{titles[tab]}</span>
      <span style={hdr.badge}>{tableLabel}</span>
    </header>
  );
}

const hdr = {
  root: {
    position: "sticky" as const,
    top: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    background: "rgba(10,10,15,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  title: {
    fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#c9a84c",
    letterSpacing: "0.02em",
  },
  badge: {
    fontSize: "0.75rem",
    color: "rgba(240,237,230,0.55)",
    background: "rgba(255,255,255,0.06)",
    padding: "3px 10px",
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.1)",
  },
};

// ── Nav ───────────────────────────────────────────────────────────────────────

interface NavProps {
  tab: Tab;
  onTab: (t: Tab) => void;
  cartCount: number;
}

function Nav({ tab, onTab, cartCount: count }: NavProps) {
  const items: { key: Tab; icon: string; label: string }[] = [
    { key: "home", icon: "⌂", label: "Inicio" },
    { key: "menu", icon: "☰", label: "Carta" },
    { key: "order", icon: "◷", label: "Pedido" },
    { key: "waiter", icon: "◎", label: "Camarero" },
    { key: "bill", icon: "◈", label: "Cuenta" },
    { key: "ai", icon: "✦", label: "Luca" },
  ];
  return (
    <nav style={nav.root}>
      {items.map((it) => (
        <button key={it.key} onClick={() => onTab(it.key)} style={nav.btn(tab === it.key)}>
          <span style={nav.icon}>
            {it.icon}
            {it.key === "menu" && count > 0 && (
              <span style={nav.dot}>{count}</span>
            )}
          </span>
          <span style={nav.label}>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}

const nav = {
  root: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    background: "rgba(10,10,15,0.96)",
    backdropFilter: "blur(16px)",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    zIndex: 50,
  },
  btn: (active: boolean) =>
    ({
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: 2,
      padding: "10px 4px",
      color: active ? "#c9a84c" : "rgba(240,237,230,0.4)",
      transition: "color 0.18s",
      fontSize: "1.15rem",
      position: "relative" as const,
    } as React.CSSProperties),
  icon: { position: "relative" as const },
  dot: {
    position: "absolute" as const,
    top: -4,
    right: -8,
    background: "#c9a84c",
    color: "#0a0a0f",
    fontSize: "0.6rem",
    fontWeight: 700,
    width: 16,
    height: 16,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  label: { fontSize: "0.6rem", letterSpacing: "0.04em", textTransform: "uppercase" as const },
};

// ── Home ──────────────────────────────────────────────────────────────────────

function Home({ tableCtx, onTab }: { tableCtx: TableContext; onTab: (t: Tab) => void }) {
  return (
    <div style={{ padding: "24px 20px", paddingBottom: 80 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontFamily: "var(--font-playfair, serif)", fontSize: "2rem", color: "#c9a84c", lineHeight: 1.2 }}>
          Benvenuti
        </p>
        <p style={{ color: "rgba(240,237,230,0.55)", marginTop: 6, fontSize: "0.9rem" }}>
          {tableCtx.tableLabel} · {tableCtx.zone}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {(
          [
            { icon: "☰", label: "Ver carta", sub: "Ver el menú completo", tab: "menu" as Tab, accent: "#c9a84c" },
            { icon: "◷", label: "Mi pedido", sub: "Estado de tus platos", tab: "order" as Tab, accent: "#60a5fa" },
            { icon: "◎", label: "Camarero", sub: "Llamar al servicio", tab: "waiter" as Tab, accent: "#4ade80" },
            { icon: "◈", label: "Cuenta", sub: "Solicitar el cobro", tab: "bill" as Tab, accent: "#f87171" },
          ] as const
        ).map((card) => (
          <button key={card.tab} onClick={() => onTab(card.tab)} style={homeCard(card.accent)}>
            <span style={{ fontSize: "1.8rem", marginBottom: 8, display: "block" }}>{card.icon}</span>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", display: "block", color: card.accent }}>{card.label}</span>
            <span style={{ fontSize: "0.75rem", color: "rgba(240,237,230,0.45)", display: "block", marginTop: 2 }}>{card.sub}</span>
          </button>
        ))}
      </div>

      {PROMOS.map((p) => (
        <div key={p.id} style={promoCard}>
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.title}</p>
            <p style={{ fontSize: "0.8rem", color: "rgba(240,237,230,0.55)", marginTop: 2 }}>{p.desc}</p>
          </div>
          <span style={promoBadge}>{p.badge}</span>
        </div>
      ))}

      <button
        onClick={() => onTab("ai")}
        style={{
          width: "100%",
          marginTop: 16,
          padding: "14px 16px",
          background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.05))",
          border: "1px solid rgba(201,168,76,0.25)",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "#f0ede6",
          textAlign: "left" as const,
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>✦</span>
        <div>
          <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#c9a84c" }}>Luca, tu asistente</p>
          <p style={{ fontSize: "0.78rem", color: "rgba(240,237,230,0.5)", marginTop: 2 }}>
            Pregunta sobre alérgenos, maridajes o llama al camarero
          </p>
        </div>
      </button>
    </div>
  );
}

function homeCard(accent: string): React.CSSProperties {
  return {
    background: "#13131a",
    border: `1px solid rgba(255,255,255,0.07)`,
    borderRadius: 16,
    padding: "18px 14px",
    textAlign: "center",
    color: "#f0ede6",
    transition: "background 0.18s",
  };
}

const promoCard: React.CSSProperties = {
  background: "#13131a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14,
  padding: "14px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 10,
};

const promoBadge: React.CSSProperties = {
  background: "rgba(201,168,76,0.15)",
  color: "#c9a84c",
  fontSize: "0.7rem",
  fontWeight: 700,
  padding: "3px 10px",
  borderRadius: 20,
  border: "1px solid rgba(201,168,76,0.3)",
  whiteSpace: "nowrap",
};

// ── Menu ──────────────────────────────────────────────────────────────────────

interface MenuProps {
  items: MenuItem[];
  cart: CartItem[];
  onAdd: (item: MenuItem) => void;
  onRemove: (id: string) => void;
  onOpenCart: () => void;
}

function Menu({ items, cart, onAdd, onRemove, onOpenCart }: MenuProps) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string>("Todo");

  const filtered = items.filter((m) => {
    const matchCat = cat === "Todo" || m.category === cat;
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const count = cartCount(cart);
  const total = cartTotal(cart);

  return (
    <div style={{ paddingBottom: count > 0 ? 140 : 80 }}>
      <div style={{ padding: "16px 20px 0" }}>
        <input
          placeholder="Buscar platos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInput}
        />
        <div style={{ display: "flex", gap: 8, overflowX: "auto" as const, paddingBottom: 8, marginTop: 12, scrollbarWidth: "none" as const }}>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} style={catChip(cat === c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "8px 20px" }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "rgba(240,237,230,0.4)", padding: "40px 0" }}>
            No hay platos que coincidan.
          </p>
        ) : (
          filtered.map((item) => {
            const inCart = cart.find((c) => c.item.id === item.id);
            const qty = inCart?.qty ?? 0;
            return <MenuCard key={item.id} item={item} qty={qty} onAdd={onAdd} onRemove={onRemove} />;
          })
        )}
      </div>

      {count > 0 && (
        <div style={floatingCart}>
          <button onClick={onOpenCart} style={floatingCartBtn}>
            <span style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "2px 8px", fontWeight: 700 }}>
              {count}
            </span>
            <span style={{ flex: 1, textAlign: "center" as const }}>Ver carrito</span>
            <span style={{ fontWeight: 700 }}>{money(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

const searchInput: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "#13131a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  color: "#f0ede6",
  fontSize: "0.9rem",
  outline: "none",
};

function catChip(active: boolean): React.CSSProperties {
  return {
    flexShrink: 0,
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: "0.8rem",
    fontWeight: active ? 600 : 400,
    background: active ? "#c9a84c" : "rgba(255,255,255,0.06)",
    color: active ? "#0a0a0f" : "rgba(240,237,230,0.6)",
    border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
    whiteSpace: "nowrap" as const,
  };
}

const floatingCart: React.CSSProperties = {
  position: "fixed",
  bottom: 70,
  left: 20,
  right: 20,
  zIndex: 40,
};

const floatingCartBtn: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "14px 16px",
  background: "#c9a84c",
  color: "#0a0a0f",
  borderRadius: 14,
  fontWeight: 600,
  fontSize: "0.95rem",
  boxShadow: "0 4px 20px rgba(201,168,76,0.4)",
};

function MenuCard({
  item,
  qty,
  onAdd,
  onRemove,
}: {
  item: MenuItem;
  qty: number;
  onAdd: (i: MenuItem) => void;
  onRemove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const oos = item.stockStatus === "out";

  return (
    <div style={mCard.root(oos)}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
            <p style={mCard.name}>{item.name}</p>
            {item.tags.slice(0, 2).map((t) => (
              <span key={t} style={mCard.tag}>{t}</span>
            ))}
          </div>
          <p style={mCard.subtitle}>{item.subtitle}</p>

          {expanded && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: "0.82rem", color: "rgba(240,237,230,0.65)", lineHeight: 1.5 }}>{item.description}</p>
              {item.allergens.length > 0 && (
                <p style={{ fontSize: "0.75rem", color: "rgba(240,237,230,0.4)", marginTop: 6 }}>
                  ⚠ {item.allergens.join(", ")}
                </p>
              )}
              {item.winePair && (
                <p style={{ fontSize: "0.75rem", color: "#c9a84c", marginTop: 4 }}>
                  🍷 {item.winePair}
                </p>
              )}
              <p style={{ fontSize: "0.75rem", color: "rgba(240,237,230,0.35)", marginTop: 4 }}>
                ~{item.avgPrepMinutes} min · {item.kcal} kcal
              </p>
            </div>
          )}

          <button
            onClick={() => setExpanded((e) => !e)}
            style={{ fontSize: "0.75rem", color: "#c9a84c", marginTop: 6, background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            {expanded ? "Menos ▲" : "Más info ▼"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 8, minWidth: 80 }}>
          <p style={mCard.price}>{money(item.price)}</p>
          {oos ? (
            <span style={{ fontSize: "0.7rem", color: "#f87171", background: "rgba(248,113,113,0.1)", padding: "3px 8px", borderRadius: 8 }}>
              Agotado
            </span>
          ) : qty === 0 ? (
            <button onClick={() => onAdd(item)} style={mCard.addBtn}>+ Añadir</button>
          ) : (
            <div style={mCard.qtyRow}>
              <button onClick={() => onRemove(item.id)} style={mCard.qtyBtn}>−</button>
              <span style={{ fontWeight: 600, fontSize: "0.9rem", minWidth: 20, textAlign: "center" as const }}>{qty}</span>
              <button onClick={() => onAdd(item)} style={mCard.qtyBtn}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const mCard = {
  root: (oos: boolean): React.CSSProperties => ({
    background: "#13131a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "14px 14px",
    marginBottom: 10,
    opacity: oos ? 0.55 : 1,
  }),
  name: { fontWeight: 600, fontSize: "0.92rem", color: "#f0ede6" } as React.CSSProperties,
  subtitle: { fontSize: "0.78rem", color: "rgba(240,237,230,0.45)", marginTop: 2 } as React.CSSProperties,
  price: { fontWeight: 700, fontSize: "0.95rem", color: "#c9a84c" } as React.CSSProperties,
  tag: {
    fontSize: "0.65rem",
    background: "rgba(74,222,128,0.12)",
    color: "#4ade80",
    padding: "2px 7px",
    borderRadius: 10,
    border: "1px solid rgba(74,222,128,0.2)",
  } as React.CSSProperties,
  addBtn: {
    background: "rgba(201,168,76,0.12)",
    color: "#c9a84c",
    border: "1px solid rgba(201,168,76,0.3)",
    borderRadius: 10,
    padding: "5px 12px",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
  } as React.CSSProperties,
  qtyRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: "3px 8px",
  } as React.CSSProperties,
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    background: "rgba(255,255,255,0.08)",
    color: "#f0ede6",
    fontWeight: 700,
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  } as React.CSSProperties,
};

// ── CartDrawer ────────────────────────────────────────────────────────────────

interface CartDrawerProps {
  cart: CartItem[];
  note: string;
  onClose: () => void;
  onAdd: (item: MenuItem) => void;
  onRemove: (id: string) => void;
  onNoteChange: (n: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

function CartDrawer({ cart, note, onClose, onAdd, onRemove, onNoteChange, onSubmit, submitting }: CartDrawerProps) {
  const total = cartTotal(cart);

  return (
    <div style={drawer.overlay} onClick={onClose}>
      <div style={drawer.panel} onClick={(e) => e.stopPropagation()}>
        <div style={drawer.handle} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: "1.05rem" }}>Tu pedido</p>
          <button onClick={onClose} style={{ color: "rgba(240,237,230,0.5)", fontSize: "1.3rem" }}>✕</button>
        </div>

        <div style={{ overflowY: "auto" as const, maxHeight: "40vh", marginBottom: 16 }}>
          {cart.map(({ item, qty }) => (
            <div key={item.id} style={drawer.row}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: "0.88rem" }}>{item.name}</p>
                <p style={{ fontSize: "0.78rem", color: "rgba(240,237,230,0.45)" }}>{money(item.price)} · ud</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => onRemove(item.id)} style={drawer.qBtn}>−</button>
                <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" as const }}>{qty}</span>
                <button onClick={() => onAdd(item)} style={drawer.qBtn}>+</button>
                <span style={{ minWidth: 60, textAlign: "right" as const, fontWeight: 600, color: "#c9a84c" }}>
                  {money(item.price * qty)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <textarea
          placeholder="Nota para cocina (alergias, variaciones…)"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={2}
          style={{ ...searchInput, resize: "none" as const, marginBottom: 16 }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ color: "rgba(240,237,230,0.55)" }}>Total</span>
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#c9a84c" }}>{money(total)}</span>
        </div>

        <button
          onClick={onSubmit}
          disabled={submitting || cart.length === 0}
          style={{
            ...floatingCartBtn,
            justifyContent: "center",
            opacity: submitting ? 0.7 : 1,
            width: "100%",
          }}
        >
          {submitting ? "Enviando…" : "Confirmar pedido"}
        </button>
      </div>
    </div>
  );
}

const drawer = {
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    zIndex: 100,
    display: "flex",
    alignItems: "flex-end",
  },
  panel: {
    width: "100%",
    background: "#13131a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: "16px 20px 32px",
    boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
    maxHeight: "90dvh",
    overflowY: "auto" as const,
  },
  handle: {
    width: 40,
    height: 4,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    margin: "0 auto 20px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  } as React.CSSProperties,
  qBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "rgba(255,255,255,0.08)",
    color: "#f0ede6",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
};

// ── OrderStatus ───────────────────────────────────────────────────────────────

function OrderStatus({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ fontSize: "2.5rem", marginBottom: 16 }}>🍽️</p>
        <p style={{ color: "rgba(240,237,230,0.45)" }}>Aún no tienes pedidos activos.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px", paddingBottom: 80 }}>
      {orders.map((order) => (
        <div key={order.id} style={ord.card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              Pedido #{order.id.slice(-6)}
            </p>
            <span style={ord.statusChip(order.status)}>{ord.statusLabel(order.status)}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, position: "relative" }}>
            {KITCHEN_STEPS.map((step, i) => {
              const idx = statusIndex(order.status as KitchenStatus);
              const done = i <= idx;
              const active = i === idx;
              return (
                <div key={step.key} style={ord.step(done, active)}>
                  <div style={ord.stepDot(done, active)}>
                    {done ? "✓" : step.icon}
                  </div>
                  <span style={{ fontSize: "0.65rem", marginTop: 4, textAlign: "center" as const, color: done ? "#c9a84c" : "rgba(240,237,230,0.3)" }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
            <div style={ord.progressLine}>
              <div style={ord.progressFill(statusIndex(order.status as KitchenStatus))} />
            </div>
          </div>

          {order.etaMinutes !== null && (
            <p style={{ fontSize: "0.8rem", color: "#60a5fa", marginBottom: 12 }}>
              ⏱ Tiempo estimado: ~{order.etaMinutes} min
            </p>
          )}

          {order.items.length > 0 && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, marginTop: 4 }}>
              {order.items.map(({ item, qty }) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "3px 0" }}>
                  <span style={{ color: "rgba(240,237,230,0.65)" }}>{qty}× {item.name}</span>
                  <span style={{ color: "#c9a84c" }}>{money(item.price * qty)}</span>
                </div>
              ))}
            </div>
          )}

          {order.note && (
            <p style={{ fontSize: "0.75rem", color: "rgba(240,237,230,0.4)", marginTop: 8 }}>
              Nota: {order.note}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: "rgba(240,237,230,0.5)", fontSize: "0.85rem" }}>Total</span>
            <span style={{ fontWeight: 700, color: "#c9a84c" }}>{money(order.total)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const ord = {
  card: {
    background: "#13131a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "16px",
    marginBottom: 14,
  } as React.CSSProperties,
  statusLabel: (s: string) => {
    const map: Record<string, string> = {
      received: "Recibido",
      prep: "En cocina",
      plating: "Emplatando",
      served: "Servido",
    };
    return map[s] ?? s;
  },
  statusChip: (s: string): React.CSSProperties => {
    const colors: Record<string, string> = {
      received: "#60a5fa",
      prep: "#f59e0b",
      plating: "#a78bfa",
      served: "#4ade80",
    };
    const c = colors[s] ?? "#60a5fa";
    return {
      fontSize: "0.72rem",
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: 20,
      background: `${c}18`,
      color: c,
      border: `1px solid ${c}40`,
    };
  },
  step: (_done: boolean, _active: boolean): React.CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1,
    flex: 1,
  }),
  stepDot: (done: boolean, active: boolean): React.CSSProperties => ({
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: done ? "#c9a84c" : "rgba(255,255,255,0.07)",
    border: active ? "2px solid #c9a84c" : done ? "none" : "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: done ? "0.8rem" : "1rem",
    color: done ? "#0a0a0f" : "rgba(240,237,230,0.3)",
    fontWeight: 700,
  }),
  progressLine: {
    position: "absolute" as const,
    top: 15,
    left: "12.5%",
    right: "12.5%",
    height: 2,
    background: "rgba(255,255,255,0.08)",
    zIndex: 0,
  },
  progressFill: (idx: number): React.CSSProperties => ({
    height: "100%",
    width: `${(idx / (KITCHEN_STEPS.length - 1)) * 100}%`,
    background: "#c9a84c",
    borderRadius: 2,
    transition: "width 0.6s ease",
  }),
};

// ── Waiter ────────────────────────────────────────────────────────────────────

interface WaiterProps {
  tableCtx: TableContext;
  pending: boolean;
  onCall: (reason: string) => void;
  calling: boolean;
}

function Waiter({ pending, onCall, calling }: WaiterProps) {
  const [selected, setSelected] = useState<string | null>(null);

  if (pending) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16, animation: "pulse 2s infinite" }}>◎</div>
        <p style={{ fontWeight: 600, fontSize: "1.1rem", color: "#4ade80" }}>Camarero en camino</p>
        <p style={{ color: "rgba(240,237,230,0.45)", marginTop: 8, fontSize: "0.9rem" }}>
          Llegará en breve a tu mesa
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px", paddingBottom: 80 }}>
      <p style={{ color: "rgba(240,237,230,0.55)", marginBottom: 20, fontSize: "0.9rem" }}>
        Selecciona el motivo y confirma para avisar al servicio.
      </p>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
        {WAITER_REASONS.map((r) => (
          <button key={r} onClick={() => setSelected(r)} style={waiterReason(selected === r)}>
            {r}
          </button>
        ))}
      </div>
      <button
        onClick={() => selected && onCall(selected)}
        disabled={!selected || calling}
        style={{
          ...floatingCartBtn,
          justifyContent: "center",
          width: "100%",
          background: selected ? "#4ade80" : "rgba(255,255,255,0.1)",
          color: selected ? "#0a0a0f" : "rgba(240,237,230,0.3)",
          opacity: calling ? 0.7 : 1,
        }}
      >
        {calling ? "Llamando…" : "Llamar al camarero"}
      </button>
    </div>
  );
}

function waiterReason(active: boolean): React.CSSProperties {
  return {
    padding: "14px 16px",
    background: active ? "rgba(74,222,128,0.12)" : "#13131a",
    border: active ? "1px solid rgba(74,222,128,0.4)" : "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    color: active ? "#4ade80" : "#f0ede6",
    fontWeight: active ? 600 : 400,
    textAlign: "left" as const,
    fontSize: "0.9rem",
    cursor: "pointer",
  };
}

// ── Bill ──────────────────────────────────────────────────────────────────────

interface BillProps {
  orders: Order[];
  tableCtx: TableContext;
  onRequest: () => void;
  requesting: boolean;
  requested: boolean;
}

function Bill({ orders, onRequest, requesting, requested }: BillProps) {
  const total = ordersTotal(orders);

  return (
    <div style={{ padding: "24px 20px", paddingBottom: 80 }}>
      <div style={billTotal}>
        <p style={{ color: "rgba(240,237,230,0.55)", fontSize: "0.88rem" }}>Total acumulado</p>
        <p style={{ fontFamily: "var(--font-playfair, serif)", fontSize: "2.2rem", color: "#c9a84c", fontWeight: 700, marginTop: 4 }}>
          {money(total)}
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        {orders.map((order) => (
          <div key={order.id} style={{ marginBottom: 14 }}>
            <p style={{ fontSize: "0.8rem", color: "rgba(240,237,230,0.4)", marginBottom: 6 }}>
              Pedido #{order.id.slice(-6)} · {ord.statusLabel(order.status)}
            </p>
            {order.items.map(({ item, qty }) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span>{qty}× {item.name}</span>
                <span style={{ color: "#c9a84c" }}>{money(item.price * qty)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {requested ? (
        <div style={{ textAlign: "center", padding: "20px", background: "rgba(74,222,128,0.08)", borderRadius: 14, border: "1px solid rgba(74,222,128,0.2)" }}>
          <p style={{ fontSize: "1.5rem", marginBottom: 8 }}>✓</p>
          <p style={{ color: "#4ade80", fontWeight: 600 }}>Cuenta solicitada</p>
          <p style={{ color: "rgba(240,237,230,0.45)", fontSize: "0.85rem", marginTop: 4 }}>El camarero llegará en breve con el cobro.</p>
        </div>
      ) : (
        <button
          onClick={onRequest}
          disabled={requesting || total === 0}
          style={{
            ...floatingCartBtn,
            justifyContent: "center",
            width: "100%",
            background: total > 0 ? "#c9a84c" : "rgba(255,255,255,0.1)",
            color: total > 0 ? "#0a0a0f" : "rgba(240,237,230,0.3)",
            opacity: requesting ? 0.7 : 1,
          }}
        >
          {requesting ? "Solicitando…" : "Solicitar la cuenta"}
        </button>
      )}
    </div>
  );
}

const billTotal: React.CSSProperties = {
  background: "#13131a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 16,
  padding: "20px",
  textAlign: "center",
  marginBottom: 24,
};

// ── Feedback ──────────────────────────────────────────────────────────────────

interface FeedbackProps {
  tableCtx: TableContext;
  onSubmit: (rating: number, comment: string) => void;
  submitting: boolean;
  submitted: boolean;
}

function Feedback({ onSubmit, submitting, submitted }: FeedbackProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (submitted) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <p style={{ fontSize: "3rem", marginBottom: 16 }}>⭐</p>
        <p style={{ fontWeight: 600, fontSize: "1.1rem", color: "#c9a84c" }}>¡Gracias por tu opinión!</p>
        <p style={{ color: "rgba(240,237,230,0.45)", marginTop: 8 }}>Nos ayuda a mejorar cada día.</p>
        <a
          href="https://g.page/r/review"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 24,
            padding: "12px 24px",
            background: "rgba(201,168,76,0.12)",
            color: "#c9a84c",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Dejar reseña en Google ↗
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px", paddingBottom: 80 }}>
      <p style={{ color: "rgba(240,237,230,0.55)", marginBottom: 24, fontSize: "0.9rem" }}>
        ¿Cómo ha sido tu experiencia?
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            style={{
              fontSize: "2.2rem",
              opacity: n <= rating ? 1 : 0.25,
              transition: "opacity 0.15s, transform 0.1s",
              transform: n <= rating ? "scale(1.1)" : "scale(1)",
            }}
          >
            ⭐
          </button>
        ))}
      </div>

      <textarea
        placeholder="Cuéntanos qué te ha parecido (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        style={{ ...searchInput, resize: "none" as const, marginBottom: 20 }}
      />

      <button
        onClick={() => rating > 0 && onSubmit(rating, comment)}
        disabled={rating === 0 || submitting}
        style={{
          ...floatingCartBtn,
          justifyContent: "center",
          width: "100%",
          background: rating > 0 ? "#c9a84c" : "rgba(255,255,255,0.1)",
          color: rating > 0 ? "#0a0a0f" : "rgba(240,237,230,0.3)",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Enviando…" : "Enviar opinión"}
      </button>
    </div>
  );
}

// ── Assistant (Luca) ──────────────────────────────────────────────────────────

function Assistant({ menuItems, onTab }: { menuItems: MenuItem[]; onTab: (t: Tab) => void }) {
  const [messages, setMessages] = useState<AiMessage[]>([
    { role: "assistant", text: "Hola, soy Luca 👋 Tu asistente de mesa. ¿En qué puedo ayudarte?" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const userMsg: AiMessage = { role: "user", text };
      const assistantText = aiReply(text, menuItems);

      // Side effect: if user asks to call waiter, navigate
      if (text.toLowerCase().includes("camarero") || text.toLowerCase().includes("llama")) {
        setTimeout(() => onTab("waiter"), 800);
      }
      if (text.toLowerCase().includes("pagar") || text.toLowerCase().includes("cuenta")) {
        setTimeout(() => onTab("bill"), 800);
      }

      setMessages((prev) => [...prev, userMsg, { role: "assistant", text: assistantText }]);
      setInput("");
    },
    [menuItems, onTab]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, height: "calc(100dvh - 120px)" }}>
      <div style={{ flex: 1, overflowY: "auto" as const, padding: "16px 20px" }}>
        <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
          {AI_QUICK_QUESTIONS.map((q) => (
            <button key={q} onClick={() => send(q)} style={aiChip}>
              {q}
            </button>
          ))}
        </div>

        {messages.map((m, i) => (
          <div key={i} style={aiBubble(m.role)}>
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: 10, paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Escribe tu pregunta…"
          style={{ ...searchInput, flex: 1 }}
        />
        <button
          onClick={() => send(input)}
          style={{
            padding: "0 18px",
            background: "#c9a84c",
            color: "#0a0a0f",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

const aiChip: React.CSSProperties = {
  padding: "6px 12px",
  background: "rgba(201,168,76,0.08)",
  border: "1px solid rgba(201,168,76,0.2)",
  borderRadius: 20,
  color: "#c9a84c",
  fontSize: "0.78rem",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

function aiBubble(role: "user" | "assistant"): React.CSSProperties {
  return {
    maxWidth: "82%",
    marginLeft: role === "user" ? "auto" : 0,
    marginBottom: 10,
    padding: "10px 14px",
    background: role === "user" ? "rgba(201,168,76,0.15)" : "#1a1a24",
    border: role === "user" ? "1px solid rgba(201,168,76,0.25)" : "1px solid rgba(255,255,255,0.07)",
    borderRadius: role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
    color: "#f0ede6",
    fontSize: "0.88rem",
    lineHeight: 1.55,
  };
}

// ── Root component ────────────────────────────────────────────────────────────

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

  const handleSubmitOrder = useCallback(async () => {
    if (!session.tableCtx) return;
    setSubmittingOrder(true);
    const result = await session.submitOrder(session.cart, session.cartNote, session.tableCtx);
    setSubmittingOrder(false);
    if (result.ok) {
      setCartOpen(false);
      setTab("order");
    }
  }, [session]);

  const handleCallWaiter = useCallback(
    async (reason: string) => {
      if (!session.tableCtx) return;
      setCallingWaiter(true);
      await session.callWaiter(reason, session.tableCtx);
      setCallingWaiter(false);
    },
    [session]
  );

  const handleRequestBill = useCallback(async () => {
    if (!session.tableCtx) return;
    setRequestingBill(true);
    const total = ordersTotal(session.orders);
    const result = await session.requestBill(total, session.tableCtx);
    setRequestingBill(false);
    if (result.ok) setBillRequested(true);
  }, [session]);

  const handleSendFeedback = useCallback(
    async (rating: number, comment: string) => {
      if (!session.tableCtx) return;
      setSubmittingFeedback(true);
      const result = await session.sendFeedback(rating, comment, session.tableCtx);
      setSubmittingFeedback(false);
      if (result.ok) setFeedbackSubmitted(true);
    },
    [session]
  );

  // ── Loading / error states ──────────────────────────────────────────────

  if (session.loading) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(201,168,76,0.2)", borderTop: "3px solid #c9a84c", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "rgba(240,237,230,0.45)", fontSize: "0.88rem" }}>Cargando tu mesa…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (session.error || !session.tableCtx) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, padding: "0 24px" }}>
        <p style={{ fontSize: "2.5rem" }}>⚠️</p>
        <p style={{ fontWeight: 600, textAlign: "center" }}>Mesa no encontrada</p>
        <p style={{ color: "rgba(240,237,230,0.45)", textAlign: "center", fontSize: "0.88rem" }}>
          {session.error ?? "El código QR no corresponde a ninguna mesa activa."}
        </p>
      </div>
    );
  }

  const { tableCtx } = session;
  const count = cartCount(session.cart);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>

      <Header tab={tab} tableLabel={tableCtx.tableLabel} />

      <main style={{ minHeight: "calc(100dvh - 56px - 62px)" }}>
        {tab === "home" && <Home tableCtx={tableCtx} onTab={setTab} />}
        {tab === "menu" && (
          <Menu
            items={session.menuItems}
            cart={session.cart}
            onAdd={session.addItem}
            onRemove={session.removeItem}
            onOpenCart={() => setCartOpen(true)}
          />
        )}
        {tab === "order" && <OrderStatus orders={session.orders} />}
        {tab === "waiter" && (
          <Waiter
            tableCtx={tableCtx}
            pending={session.waiterCall.pending}
            onCall={handleCallWaiter}
            calling={callingWaiter}
          />
        )}
        {tab === "bill" && (
          <Bill
            orders={session.orders}
            tableCtx={tableCtx}
            onRequest={handleRequestBill}
            requesting={requestingBill}
            requested={billRequested}
          />
        )}
        {tab === "feedback" && (
          <Feedback
            tableCtx={tableCtx}
            onSubmit={handleSendFeedback}
            submitting={submittingFeedback}
            submitted={feedbackSubmitted}
          />
        )}
        {tab === "ai" && <Assistant menuItems={session.menuItems} onTab={setTab} />}
      </main>

      <Nav tab={tab} onTab={setTab} cartCount={count} />

      {cartOpen && (
        <CartDrawer
          cart={session.cart}
          note={session.cartNote}
          onClose={() => setCartOpen(false)}
          onAdd={session.addItem}
          onRemove={session.removeItem}
          onNoteChange={session.setCartNote}
          onSubmit={handleSubmitOrder}
          submitting={submittingOrder}
        />
      )}
    </>
  );
}
