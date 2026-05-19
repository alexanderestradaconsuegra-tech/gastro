"use client";

import React, { useState, useMemo } from "react";
import { useBackofficeState } from "@/hooks/useBackofficeState";
import {
  ADMIN_TABS,
  CAMARERO_TABS,
  MenuItem,
  ORDER_STATUS_LABELS,
  OrderStatus,
  PRIORITY_COLORS,
  STATUS_COLORS,
  StaffMember,
  StaffRole,
  TabId,
  WEBHOOKS,
} from "@/lib/constants";
import type { StaffProfile } from "@/hooks/useAuth";

const COCINA_TABS = ["dashboard", "kitchen", "orders"] as const;
const CAJA_TABS   = ["dashboard", "tables", "orders", "sales", "reviews"] as const;

function tabsForRole(role: StaffRole): TabId[] {
  if (role === "admin")    return ADMIN_TABS.map((t) => t.id);
  if (role === "cocina")   return [...COCINA_TABS] as TabId[];
  if (role === "caja")     return [...CAJA_TABS] as TabId[];
  return [...CAMARERO_TABS] as TabId[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);
}

function ago(ms: number) {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

function relTime(iso: string) {
  return ago(new Date(iso).getTime());
}

// ─── style helpers ───────────────────────────────────────────────────────────

const S = {
  sidebar: {
    width: 200,
    minWidth: 200,
    background: "var(--panel)",
    borderRight: "1px solid var(--line)",
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    position: "sticky" as const,
    top: 0,
  },
  main: {
    flex: 1,
    overflow: "auto",
    height: "100vh",
    background: "var(--bg)",
  },
  panel: {
    background: "var(--panel)",
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: 20,
  },
  panel2: {
    background: "var(--panel2)",
    border: "1px solid var(--line)",
    borderRadius: 8,
    padding: 16,
  },
  btn: {
    background: "var(--panel2)",
    border: "1px solid var(--line)",
    color: "var(--text)",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 13,
    cursor: "pointer",
  },
  btnGold: {
    background: "var(--gold)",
    border: "none",
    color: "#000",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnGreen: {
    background: "var(--green)",
    border: "none",
    color: "#000",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnRed: {
    background: "var(--red)",
    border: "none",
    color: "#fff",
    borderRadius: 6,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  input: {
    background: "var(--panel2)",
    border: "1px solid var(--line)",
    color: "var(--text)",
    borderRadius: 6,
    padding: "8px 12px",
    fontSize: 13,
    outline: "none",
    width: "100%",
  },
  badge: (color: string) => ({
    background: color + "22",
    color,
    borderRadius: 4,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 600,
    display: "inline-block",
  }),
  kpiCard: {
    background: "var(--panel)",
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: "20px 24px",
    flex: 1,
  },
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({
  activeTab,
  setTab,
  staffMember,
  demoMode,
  setDemoMode,
  onSignOut,
}: {
  activeTab: TabId;
  setTab: (t: TabId) => void;
  staffMember: StaffMember;
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
  onSignOut?: () => void;
}) {
  const tabs = ADMIN_TABS.filter((t) =>
    tabsForRole(staffMember.role).includes(t.id)
  );

  return (
    <aside style={S.sidebar}>
      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ color: "var(--gold)", fontWeight: 700, fontSize: 17, letterSpacing: 1 }}>
          GASTRO
        </div>
        <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>Sistema Admin</div>
      </div>

      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, marginBottom: 2 }}>
          {staffMember.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--green)",
              }}
            />
            <span style={{ color: "var(--muted)", fontSize: 11 }}>{staffMember.role}</span>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              style={{
                background: "none",
                border: "none",
                color: "var(--dim)",
                fontSize: 11,
                cursor: "pointer",
                padding: "2px 4px",
              }}
              title="Cerrar sesión"
            >
              ⏻
            </button>
          )}
        </div>
      </div>

      <nav style={{ flex: 1, overflow: "auto", padding: "8px 8px" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "9px 10px",
              borderRadius: 7,
              border: "none",
              background: activeTab === t.id ? "var(--panel2)" : "transparent",
              color: activeTab === t.id ? "var(--gold)" : "var(--muted)",
              fontSize: 13,
              fontWeight: activeTab === t.id ? 600 : 400,
              textAlign: "left",
              cursor: "pointer",
              marginBottom: 1,
              transition: "all .15s",
            }}
          >
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--line)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span style={{ color: "var(--muted)", fontSize: 11 }}>Datos demo</span>
          <button
            onClick={() => setDemoMode(!demoMode)}
            style={{
              width: 34,
              height: 18,
              borderRadius: 9,
              border: "none",
              background: demoMode ? "var(--gold)" : "var(--dim)",
              position: "relative",
              cursor: "pointer",
              transition: "background .2s",
            }}
          >
            <span
              style={{
                position: "absolute",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#fff",
                top: 3,
                left: demoMode ? 18 : 4,
                transition: "left .2s",
              }}
            />
          </button>
        </div>
        <div style={{ color: "var(--dim)", fontSize: 10 }}>v1.0 · Nido Restaurante</div>
      </div>
    </aside>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function TabDashboard({
  orders,
  tables,
  cashSession,
  calls,
  messages,
}: ReturnType<typeof useBackofficeState>) {
  const activeOrders = orders.filter((o) => o.status !== "served" && o.status !== "cancelled");
  const pendingCalls = calls.filter((c) => c.status === "Pendiente");
  const unreadMessages = messages.filter((m) => m.status === "unread");
  const occupiedTables = tables.filter((t) => t.status !== "Libre");
  const totalRevenue = cashSession.cash + cashSession.card + cashSession.transfer;

  const kpis = [
    { label: "Mesas activas", value: `${occupiedTables.length}/${tables.length}`, color: "var(--blue)" },
    { label: "Órdenes activas", value: activeOrders.length, color: "var(--purple)" },
    { label: "Llamados pendientes", value: pendingCalls.length, color: "var(--red)" },
    { label: "Mensajes sin leer", value: unreadMessages.length, color: "var(--amber)" },
    { label: "Recaudación turno", value: fmt(totalRevenue), color: "var(--gold)" },
    { label: "Tips", value: fmt(cashSession.tips), color: "var(--green)" },
  ];

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Dashboard</h1>
      <p style={{ color: "var(--muted)", marginBottom: 28 }}>
        Turno {cashSession.turn} · Abierto {cashSession.openedAt} · {new Date().toLocaleDateString("es-CL")}
      </p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...S.kpiCard, minWidth: 160 }}>
            <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={S.panel}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Órdenes recientes</h3>
          {orders.slice(0, 5).map((o) => (
            <div
              key={o.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{o.id}</div>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>Mesa {o.tableId} · {o.items.length} items</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={S.badge(o.priority === "Alta" ? "var(--amber)" : o.priority === "Crítica" ? "var(--red)" : "var(--muted)")}>
                  {o.priority}
                </span>
                <span style={S.badge("var(--blue)")}>
                  {ORDER_STATUS_LABELS[o.status]}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={S.panel}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Llamados urgentes</h3>
          {pendingCalls.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>Sin llamados pendientes</p>
          ) : (
            pendingCalls.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{c.type}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>Mesa {c.tableId} · {ago(c.createdAt)}</div>
                </div>
                <span style={S.badge(PRIORITY_COLORS[c.priority] ?? "var(--muted)")}>
                  {c.priority}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tables ──────────────────────────────────────────────────────────────────

function TabTables({
  tables,
  staff,
  orders,
  assignWaiter,
}: ReturnType<typeof useBackofficeState>) {
  const [selected, setSelected] = useState<number | null>(null);
  const selectedTable = tables.find((t) => t.id === selected);
  const tableOrders = orders.filter((o) => o.tableId === selected);

  const zones = [...new Set(tables.map((t) => t.zone))];
  const [zone, setZone] = useState("Todos");

  const filtered = zone === "Todos" ? tables : tables.filter((t) => t.zone === zone);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Mesas</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {["Todos", ...zones].map((z) => (
            <button
              key={z}
              onClick={() => setZone(z)}
              style={{
                ...S.btn,
                background: zone === z ? "var(--gold)" : "var(--panel2)",
                color: zone === z ? "#000" : "var(--muted)",
                fontWeight: zone === z ? 600 : 400,
              }}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {filtered.map((t) => {
          const color = STATUS_COLORS[t.status] ?? "var(--muted)";
          const isSelected = t.id === selected;
          return (
            <div
              key={t.id}
              onClick={() => setSelected(isSelected ? null : t.id)}
              style={{
                background: "var(--panel)",
                border: `1px solid ${isSelected ? "var(--gold)" : "var(--line)"}`,
                borderRadius: 10,
                padding: 16,
                cursor: "pointer",
                transition: "border-color .15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>Mesa {t.id}</div>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: color,
                    marginTop: 5,
                  }}
                />
              </div>
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>{t.zone}</div>
              <div style={{ ...S.badge(color), marginBottom: 8 }}>{t.status}</div>
              {t.guests > 0 && (
                <div style={{ color: "var(--muted)", fontSize: 12 }}>{t.guests} comensales</div>
              )}
              {t.bill > 0 && (
                <div style={{ color: "var(--gold)", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                  {fmt(t.bill)}
                </div>
              )}
              {t.waiterId && (
                <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 4 }}>
                  {staff.find((s) => s.id === t.waiterId)?.name ?? t.waiterId}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedTable && (
        <div style={{ ...S.panel, maxWidth: 500 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Mesa {selectedTable.id} — Detalle</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 11 }}>Estado</div>
              <div style={{ fontWeight: 500, marginTop: 2 }}>{selectedTable.status}</div>
            </div>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 11 }}>Zona</div>
              <div style={{ fontWeight: 500, marginTop: 2 }}>{selectedTable.zone}</div>
            </div>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 11 }}>Comensales</div>
              <div style={{ fontWeight: 500, marginTop: 2 }}>{selectedTable.guests}</div>
            </div>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 11 }}>Cuenta</div>
              <div style={{ fontWeight: 500, color: "var(--gold)", marginTop: 2 }}>{fmt(selectedTable.bill)}</div>
            </div>
            <div>
              <div style={{ color: "var(--muted)", fontSize: 11 }}>QR Token</div>
              <div style={{ fontWeight: 500, fontFamily: "monospace", marginTop: 2 }}>{selectedTable.qrToken}</div>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>Asignar camarero</div>
            <select
              style={{ ...S.input, width: "auto" }}
              value={selectedTable.waiterId ?? ""}
              onChange={(e) => assignWaiter(selectedTable.id, e.target.value)}
            >
              <option value="">Sin asignar</option>
              {staff.filter((s) => s.role === "camarero").map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {tableOrders.length > 0 && (
            <div>
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 8 }}>Órdenes</div>
              {tableOrders.map((o) => (
                <div key={o.id} style={{ ...S.panel2, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 500 }}>{o.id}</span>
                    <span style={S.badge("var(--blue)")}>{ORDER_STATUS_LABELS[o.status]}</span>
                  </div>
                  {o.items.map((it, i) => (
                    <div key={i} style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                      {it.qty}x {it.dish} — {fmt(it.price)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Orders ──────────────────────────────────────────────────────────────────

function TabOrders({ orders, updateOrderStatus, staff }: ReturnType<typeof useBackofficeState>) {
  const [filter, setFilter] = useState<string>("all");

  const statusList = ["all", "received", "prep", "plating", "served", "cancelled"];
  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Órdenes</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {statusList.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                ...S.btn,
                background: filter === s ? "var(--gold)" : "var(--panel2)",
                color: filter === s ? "#000" : "var(--muted)",
                fontWeight: filter === s ? 600 : 400,
              }}
            >
              {s === "all" ? "Todos" : ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((o) => (
          <div key={o.id} style={{ ...S.panel, display: "flex", gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{o.id}</span>
                <span style={S.badge(PRIORITY_COLORS[o.priority] ?? "var(--muted)")}>
                  {o.priority}
                </span>
                <span style={S.badge("var(--blue)")}>{ORDER_STATUS_LABELS[o.status]}</span>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>Mesa {o.tableId}</span>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>ETA {o.eta}min</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {o.items.map((it, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, color: "var(--muted)", fontSize: 13 }}>
                    <span>{it.qty}x</span>
                    <span style={{ flex: 1 }}>{it.dish}</span>
                    <span>{fmt(it.price)}</span>
                    <span style={S.badge("var(--purple)")}>{it.status}</span>
                  </div>
                ))}
              </div>
              {o.notes && (
                <div style={{ marginTop: 8, color: "var(--amber)", fontSize: 12 }}>
                  Nota: {o.notes}
                </div>
              )}
              <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 11 }}>
                {staff.find((s) => s.id === o.waiterId)?.name ?? o.waiterId} · {o.channel}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(["received", "prep", "plating", "served"] as OrderStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => updateOrderStatus(o.id, st)}
                  style={{
                    ...S.btn,
                    background: o.status === st ? "var(--gold)" : "var(--panel2)",
                    color: o.status === st ? "#000" : "var(--muted)",
                    fontWeight: o.status === st ? 600 : 400,
                    fontSize: 11,
                    padding: "5px 10px",
                  }}
                >
                  {ORDER_STATUS_LABELS[st]}
                </button>
              ))}
              <button
                onClick={() => updateOrderStatus(o.id, "cancelled")}
                style={{ ...S.btn, color: "var(--red)", fontSize: 11, padding: "5px 10px" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>
            Sin órdenes en este estado
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Kitchen ─────────────────────────────────────────────────────────────────

const KITCHEN_COLS: { status: OrderStatus; label: string; color: string }[] = [
  { status: "received", label: "Recibido", color: "var(--purple)" },
  { status: "prep", label: "Preparando", color: "var(--blue)" },
  { status: "plating", label: "Emplatando", color: "var(--amber)" },
  { status: "served", label: "Servido", color: "var(--green)" },
];

function TabKitchen({ orders, updateOrderStatus }: ReturnType<typeof useBackofficeState>) {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Cocina</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {KITCHEN_COLS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);
          return (
            <div key={col.status}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                  padding: "8px 12px",
                  background: col.color + "18",
                  borderRadius: 7,
                  border: `1px solid ${col.color}33`,
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                <span style={{ fontWeight: 600, fontSize: 13, color: col.color }}>{col.label}</span>
                <span
                  style={{
                    marginLeft: "auto",
                    background: col.color + "33",
                    color: col.color,
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {colOrders.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {colOrders.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      background: "var(--panel)",
                      border: "1px solid var(--line)",
                      borderRadius: 9,
                      padding: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontWeight: 700 }}>Mesa {o.tableId}</span>
                      <span style={{ color: "var(--muted)", fontSize: 11 }}>{o.eta}min</span>
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 8 }}>{o.id}</div>
                    {o.items.map((it, i) => (
                      <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{it.qty}×</span> {it.dish}
                      </div>
                    ))}
                    {o.notes && (
                      <div style={{ color: "var(--amber)", fontSize: 11, marginTop: 6 }}>
                        ⚠ {o.notes}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                      {col.status !== "received" && (
                        <button
                          onClick={() => {
                            const prev = KITCHEN_COLS[KITCHEN_COLS.findIndex((c) => c.status === col.status) - 1];
                            if (prev) updateOrderStatus(o.id, prev.status);
                          }}
                          style={{ ...S.btn, fontSize: 11, padding: "4px 8px" }}
                        >
                          ←
                        </button>
                      )}
                      {col.status !== "served" && (
                        <button
                          onClick={() => {
                            const next = KITCHEN_COLS[KITCHEN_COLS.findIndex((c) => c.status === col.status) + 1];
                            if (next) updateOrderStatus(o.id, next.status);
                          }}
                          style={{ ...S.btnGold, fontSize: 11, padding: "4px 8px", flex: 1 }}
                        >
                          {col.status === "plating" ? "Servir" : "Avanzar →"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {colOrders.length === 0 && (
                  <div
                    style={{
                      color: "var(--dim)",
                      fontSize: 12,
                      textAlign: "center",
                      padding: "24px 0",
                      border: "1px dashed var(--line)",
                      borderRadius: 8,
                    }}
                  >
                    Sin órdenes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Calls ───────────────────────────────────────────────────────────────────

function TabCalls({ calls, attendCall, resolveCall }: ReturnType<typeof useBackofficeState>) {
  const sorted = [...calls].sort((a, b) => {
    const prio: Record<string, number> = { Crítica: 0, Alta: 1, Normal: 2 };
    return (prio[a.priority] ?? 2) - (prio[b.priority] ?? 2);
  });

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Llamados</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((c) => {
          const prioColor = PRIORITY_COLORS[c.priority] ?? "var(--muted)";
          const isResolved = c.status === "Resuelto";
          return (
            <div
              key={c.id}
              style={{
                ...S.panel,
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                opacity: isResolved ? 0.5 : 1,
                borderLeft: `3px solid ${prioColor}`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <span style={S.badge(prioColor)}>{c.priority}</span>
                  <span style={S.badge("var(--blue)")}>{c.status}</span>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Mesa {c.tableId}</span>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{ago(c.createdAt)}</span>
                </div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.type}</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>{c.message}</div>
                <div style={{ color: "var(--dim)", fontSize: 11, marginTop: 4 }}>
                  Fuente: {c.source} · {c.id}
                </div>
              </div>
              {!isResolved && (
                <div style={{ display: "flex", gap: 8 }}>
                  {c.status === "Pendiente" && (
                    <button onClick={() => attendCall(c.id)} style={S.btnGold}>
                      Atender
                    </button>
                  )}
                  <button onClick={() => resolveCall(c.id)} style={S.btnGreen}>
                    Resolver
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {calls.length === 0 && (
          <div style={{ color: "var(--muted)", textAlign: "center", padding: 60 }}>
            Sin llamados activos
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Messages ────────────────────────────────────────────────────────────────

function TabMessages({ messages, resolveMessage }: ReturnType<typeof useBackofficeState>) {
  const [active, setActive] = useState<number | null>(null);
  const grouped = useMemo(() => {
    const map = new Map<number, typeof messages>();
    for (const m of messages) {
      const arr = map.get(m.tableId) ?? [];
      arr.push(m);
      map.set(m.tableId, arr);
    }
    return map;
  }, [messages]);

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Mensajes</h1>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...grouped.entries()].map(([tableId, msgs]) => {
            const unread = msgs.filter((m) => m.status === "unread").length;
            return (
              <div
                key={tableId}
                onClick={() => setActive(tableId)}
                style={{
                  ...S.panel,
                  cursor: "pointer",
                  border: `1px solid ${active === tableId ? "var(--gold)" : "var(--line)"}`,
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600 }}>Mesa {tableId}</span>
                  {unread > 0 && (
                    <span
                      style={{
                        background: "var(--red)",
                        color: "#fff",
                        borderRadius: "50%",
                        width: 18,
                        height: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {unread}
                    </span>
                  )}
                </div>
                <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                  {msgs[msgs.length - 1]?.text.slice(0, 40)}...
                </div>
              </div>
            );
          })}
        </div>

        <div style={S.panel}>
          {active ? (
            <>
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Mesa {active}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(grouped.get(active) ?? []).map((m) => (
                  <div
                    key={m.id}
                    style={{
                      ...S.panel2,
                      borderLeft: `3px solid ${m.fromRole === "client" ? "var(--blue)" : "var(--gold)"}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: m.fromRole === "client" ? "var(--blue)" : "var(--gold)", fontWeight: 600 }}>
                        {m.fromRole === "client" ? "Cliente" : "Staff"}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{relTime(m.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 13 }}>{m.text}</div>
                    {m.status === "unread" && (
                      <button
                        onClick={() => resolveMessage(m.id)}
                        style={{ ...S.btn, marginTop: 8, fontSize: 11, padding: "4px 10px" }}
                      >
                        Marcar leído
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: "var(--muted)", textAlign: "center", padding: 60 }}>
              Selecciona una conversación
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sales / Caja ─────────────────────────────────────────────────────────────

function TabSales({
  cashSession,
  expenses,
  closeCash,
  changeTurn,
  addExpense,
}: ReturnType<typeof useBackofficeState>) {
  const [expType, setExpType] = useState("");
  const [expDetail, setExpDetail] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const total = cashSession.cash + cashSession.card + cashSession.transfer;

  const handleClose = async () => {
    if (!confirm("¿Cerrar turno y enviar a caja?")) return;
    closeCash();
    if (process.env.N8N_WEBHOOK_BASE_URL) {
      await fetch(WEBHOOKS.cashClose, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: cashSession, expenses }),
      }).catch(() => {});
    }
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Caja</h1>
          <p style={{ color: "var(--muted)", marginTop: 2 }}>
            Turno: {cashSession.turn} · {cashSession.status === "abierta" ? "Abierta" : "Cerrada"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            style={{ ...S.input, width: "auto" }}
            value={cashSession.turn}
            onChange={(e) => changeTurn(e.target.value)}
          >
            {["Almuerzo", "Tarde", "Noche"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {cashSession.status === "abierta" && (
            <button onClick={handleClose} style={S.btnRed}>
              Cerrar turno
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Efectivo", value: cashSession.cash, color: "var(--green)" },
          { label: "Tarjeta", value: cashSession.card, color: "var(--blue)" },
          { label: "Transferencia", value: cashSession.transfer, color: "var(--purple)" },
          { label: "Propinas", value: cashSession.tips, color: "var(--gold)" },
          { label: "Gastos", value: cashSession.expenses, color: "var(--red)" },
          { label: "Total", value: total, color: "var(--gold2)" },
        ].map((k) => (
          <div key={k.label} style={S.kpiCard}>
            <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{fmt(k.value)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={S.panel}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Registrar gasto</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <select
              style={S.input}
              value={expType}
              onChange={(e) => setExpType(e.target.value)}
            >
              <option value="">Tipo de gasto…</option>
              {["Insumos", "Servicio", "Personal", "Varios"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input
              style={S.input}
              placeholder="Detalle…"
              value={expDetail}
              onChange={(e) => setExpDetail(e.target.value)}
            />
            <input
              style={S.input}
              type="number"
              placeholder="Monto"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
            />
            <button
              style={S.btnGold}
              onClick={() => {
                if (!expType || !expDetail || !expAmount) return;
                addExpense(expType, expDetail, Number(expAmount));
                setExpType("");
                setExpDetail("");
                setExpAmount("");
              }}
            >
              Registrar gasto
            </button>
          </div>
        </div>

        <div style={S.panel}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Gastos del turno</h3>
          {expenses.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>Sin gastos registrados</p>
          ) : (
            expenses.map((e) => (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{e.detail}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11 }}>{e.type}</div>
                </div>
                <div style={{ color: "var(--red)", fontWeight: 600 }}>{fmt(e.amount)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Staff ───────────────────────────────────────────────────────────────────

function TabStaff({ staff, tables }: ReturnType<typeof useBackofficeState>) {
  const ROLE_COLORS: Record<string, string> = {
    admin: "var(--gold)",
    camarero: "var(--blue)",
    cocina: "var(--orange)",
    caja: "var(--purple)",
  };

  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Personal</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {staff.map((s) => {
          const assignedTables = tables.filter((t) => t.waiterId === s.id);
          return (
            <div key={s.id} style={S.panel}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: ROLE_COLORS[s.role] + "33",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: ROLE_COLORS[s.role],
                    fontWeight: 700,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {s.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <span style={S.badge(ROLE_COLORS[s.role])}>{s.role}</span>
                    <span
                      style={S.badge(
                        s.status === "Activo" ? "var(--green)" : s.status === "Pausa" ? "var(--amber)" : "var(--muted)"
                      )}
                    >
                      {s.status}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                <div>
                  <div style={{ color: "var(--muted)", marginBottom: 2 }}>Turno</div>
                  <div>{s.shift}</div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)", marginBottom: 2 }}>Mesas</div>
                  <div>{assignedTables.length > 0 ? assignedTables.map((t) => `M${t.id}`).join(", ") : "—"}</div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)", marginBottom: 2 }}>Teléfono</div>
                  <div>{s.phone}</div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)", marginBottom: 2 }}>Email</div>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.email}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Inventory ───────────────────────────────────────────────────────────────

function TabInventory({ inventory, updateInventoryStock }: ReturnType<typeof useBackofficeState>) {
  const lowStock = inventory.filter((i) => i.stock <= i.minStock);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Inventario</h1>
        {lowStock.length > 0 && (
          <span style={S.badge("var(--red)")}>
            {lowStock.length} con stock bajo
          </span>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {inventory.map((item) => {
          const isLow = item.stock <= item.minStock;
          return (
            <div
              key={item.id}
              style={{
                ...S.panel,
                display: "flex",
                alignItems: "center",
                gap: 16,
                borderLeft: `3px solid ${isLow ? "var(--red)" : "var(--line)"}`,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>
                  {item.category} · Mín: {item.minStock} {item.unit}
                </div>
                {item.linkedDishes.length > 0 && (
                  <div style={{ color: "var(--dim)", fontSize: 11, marginTop: 2 }}>
                    Vinculado: {item.linkedDishes.join(", ")}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: isLow ? "var(--red)" : "var(--green)",
                  }}
                >
                  {item.stock}
                </div>
                <div style={{ color: "var(--muted)", fontSize: 11 }}>{item.unit}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => updateInventoryStock(item.id, -1)}
                  style={{ ...S.btn, width: 32, padding: "6px 0", textAlign: "center" }}
                >
                  −
                </button>
                <button
                  onClick={() => updateInventoryStock(item.id, 1)}
                  style={{ ...S.btnGold, width: 32, padding: "6px 0", textAlign: "center" }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── QR ──────────────────────────────────────────────────────────────────────

function TabQR({
  qrTokens,
  tables,
  toggleQr,
  regenerateQr,
}: ReturnType<typeof useBackofficeState>) {
  return (
    <div style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Tokens QR</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {qrTokens.map((q) => {
          const table = tables.find((t) => t.id === q.tableId);
          return (
            <div key={q.tableId} style={S.panel}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontWeight: 700 }}>Mesa {q.tableId}</span>
                <span style={S.badge(q.active ? "var(--green)" : "var(--red)")}>
                  {q.active ? "Activo" : "Inactivo"}
                </span>
              </div>
              {table && (
                <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 10 }}>{table.zone}</div>
              )}
              <div
                style={{
                  background: "var(--panel2)",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontFamily: "monospace",
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 2,
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                {q.token}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => toggleQr(q.tableId)}
                  style={{
                    ...S.btn,
                    flex: 1,
                    fontSize: 11,
                    color: q.active ? "var(--red)" : "var(--green)",
                  }}
                >
                  {q.active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => regenerateQr(q.tableId)}
                  style={{ ...S.btn, fontSize: 11 }}
                >
                  ↺
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

const EMPTY_ITEM: MenuItem = {
  id: "",
  name: "",
  subtitle: "",
  description: "",
  category: "Pastas",
  price: 0,
  avgPrepMinutes: 15,
  kcal: 0,
  tags: [],
  allergens: [],
  winePair: "",
  imageUrl: "",
  stockStatus: "ok",
  available: true,
  visibleClient: true,
};

function TabMenu({
  menuItems,
  saveMenuItem,
  toggleMenuAvailability,
  deleteMenuItem,
}: ReturnType<typeof useBackofficeState>) {
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuItem>(EMPTY_ITEM);

  const categories = [...new Set(menuItems.map((m) => m.category))];
  const [cat, setCat] = useState("Todos");

  const filtered = cat === "Todos" ? menuItems : menuItems.filter((m) => m.category === cat);

  const openNew = () => {
    const newItem = { ...EMPTY_ITEM, id: `m-${Date.now()}` };
    setForm(newItem);
    setEditing(newItem);
  };

  const openEdit = (item: MenuItem) => {
    setForm(item);
    setEditing(item);
  };

  const handleSave = () => {
    if (!form.name) return;
    saveMenuItem(form);
    setEditing(null);
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Carta</h1>
        <button onClick={openNew} style={S.btnGold}>
          + Agregar ítem
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["Todos", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            style={{
              ...S.btn,
              background: cat === c ? "var(--gold)" : "var(--panel2)",
              color: cat === c ? "#000" : "var(--muted)",
              fontWeight: cat === c ? 600 : 400,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: editing ? 24 : 0 }}>
        {filtered.map((item) => (
          <div
            key={item.id}
            style={{
              ...S.panel,
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: item.available ? 1 : 0.5,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span style={S.badge("var(--muted)")}>{item.category}</span>
                {item.tags.map((t) => (
                  <span key={t} style={S.badge("var(--purple)")}>{t}</span>
                ))}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{item.subtitle}</div>
              {item.allergens.length > 0 && (
                <div style={{ color: "var(--amber)", fontSize: 11, marginTop: 2 }}>
                  Alérgenos: {item.allergens.join(", ")}
                </div>
              )}
            </div>
            <div style={{ fontWeight: 700, color: "var(--gold)", fontSize: 16 }}>{fmt(item.price)}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => toggleMenuAvailability(item.id)}
                style={{
                  ...S.btn,
                  fontSize: 11,
                  color: item.available ? "var(--green)" : "var(--red)",
                }}
              >
                {item.available ? "Disponible" : "No disponible"}
              </button>
              <button onClick={() => openEdit(item)} style={S.btn}>
                Editar
              </button>
              <button
                onClick={() => {
                  if (confirm("¿Eliminar ítem?")) deleteMenuItem(item.id);
                }}
                style={{ ...S.btn, color: "var(--red)" }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={(e) => e.target === e.currentTarget && setEditing(null)}
        >
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: 28,
              width: 560,
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>
              {form.id === editing.id && !menuItems.find((m) => m.id === form.id)
                ? "Nuevo ítem"
                : "Editar ítem"}
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { key: "name", label: "Nombre", type: "text" },
                { key: "subtitle", label: "Subtítulo", type: "text" },
                { key: "category", label: "Categoría", type: "text" },
                { key: "price", label: "Precio", type: "number" },
                { key: "avgPrepMinutes", label: "Prep (min)", type: "number" },
                { key: "kcal", label: "Kcal", type: "number" },
                { key: "winePair", label: "Maridaje", type: "text" },
                { key: "imageUrl", label: "URL imagen", type: "text" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>{label}</div>
                  <input
                    style={S.input}
                    type={type}
                    value={String(form[key as keyof MenuItem] ?? "")}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [key]: type === "number" ? Number(e.target.value) : e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>Descripción</div>
              <textarea
                style={{ ...S.input, height: 80, resize: "vertical" }}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>
                Alérgenos (separados por coma)
              </div>
              <input
                style={S.input}
                value={form.allergens.join(", ")}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    allergens: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                  }))
                }
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>
                Tags (separados por coma)
              </div>
              <input
                style={S.input}
                value={form.tags.join(", ")}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    tags: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                  }))
                }
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer", fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm((prev) => ({ ...prev, available: e.target.checked }))}
                />
                Disponible
              </label>
              <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer", fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.visibleClient}
                  onChange={(e) => setForm((prev) => ({ ...prev, visibleClient: e.target.checked }))}
                />
                Visible en carta
              </label>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button onClick={handleSave} style={{ ...S.btnGold, flex: 1 }}>
                Guardar
              </button>
              <button onClick={() => setEditing(null)} style={S.btn}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

function TabReviews({ reviews, staff }: ReturnType<typeof useBackofficeState>) {
  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Reseñas</h1>
        <div style={{ ...S.kpiCard, minWidth: "auto", padding: "12px 20px" }}>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>Promedio: </span>
          <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 18 }}>★ {avg}</span>
          <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: 8 }}>({reviews.length} reseñas)</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {reviews.map((r) => (
          <div key={r.id} style={S.panel}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "var(--gold)", fontSize: 16 }}>
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </span>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>Mesa {r.tableId}</span>
                <span style={S.badge("var(--purple)")}>{r.source}</span>
              </div>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>{relTime(r.createdAt)}</span>
            </div>
            {r.comment && <div style={{ fontSize: 14 }}>{r.comment}</div>}
            <div style={{ color: "var(--dim)", fontSize: 11, marginTop: 6 }}>
              Camarero: {staff.find((s) => s.id === r.waiterId)?.name ?? r.waiterId}
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div style={{ color: "var(--muted)", textAlign: "center", padding: 60 }}>
            Sin reseñas aún
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function TabSettings() {
  const [webhooks, setWebhooks] = useState({
    base: process.env.N8N_WEBHOOK_BASE_URL ?? "",
    orderCreate: "/webhook/order-create",
    camareroCall: "/webhook/camarero-call",
    kitchenCall: "/webhook/kitchen-call",
    billRequest: "/webhook/bill-request",
    receiptPrint: "/webhook/receipt-print",
    feedback: "/webhook/feedback",
    cashClose: "/webhook/cash-close",
  });

  const [printerIp, setPrinterIp] = useState("192.168.1.100");
  const [restaurantName, setRestaurantName] = useState("Nido Restaurante");

  const handleSave = () => {
    alert("Configuración guardada (demo)");
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Configuración</h1>
        <button onClick={handleSave} style={S.btnGold}>
          Guardar cambios
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={S.panel}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Restaurante</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Nombre", value: restaurantName, set: setRestaurantName },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>{label}</div>
                <input style={S.input} value={value} onChange={(e) => set(e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div style={S.panel}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Impresora fiscal</h3>
          <div>
            <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>IP de impresora</div>
            <input
              style={S.input}
              value={printerIp}
              onChange={(e) => setPrinterIp(e.target.value)}
              placeholder="192.168.x.x"
            />
          </div>
          <button style={{ ...S.btn, marginTop: 12, fontSize: 12 }}>
            Probar conexión
          </button>
        </div>

        <div style={{ ...S.panel, gridColumn: "1 / -1" }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Webhooks n8n</h3>
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>Base URL</div>
            <input
              style={S.input}
              value={webhooks.base}
              onChange={(e) => setWebhooks((p) => ({ ...p, base: e.target.value }))}
              placeholder="https://n8n.example.com"
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {(
              [
                { key: "orderCreate", label: "Crear orden" },
                { key: "camareroCall", label: "Llamar camarero" },
                { key: "kitchenCall", label: "Llamar cocina" },
                { key: "billRequest", label: "Solicitar cuenta" },
                { key: "receiptPrint", label: "Imprimir recibo" },
                { key: "feedback", label: "Feedback" },
                { key: "cashClose", label: "Cierre de caja" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 4 }}>{label}</div>
                <input
                  style={S.input}
                  value={webhooks[key]}
                  onChange={(e) =>
                    setWebhooks((p) => ({ ...p, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GastroAdmin (root) ───────────────────────────────────────────────────────

interface GastroAdminProps {
  authStaff?: StaffProfile;
  onSignOut?: () => void;
}

export default function GastroAdmin({ authStaff, onSignOut }: GastroAdminProps) {
  const state = useBackofficeState();
  const { staff, demoMode, setDemoMode } = state;

  const initialStaff: StaffMember = authStaff
    ? (staff.find((s) => s.email === authStaff.email) ?? {
        id: authStaff.id,
        name: authStaff.name,
        email: authStaff.email,
        role: authStaff.role as StaffRole,
        shift: authStaff.shift,
        status: "Activo",
        tables: [],
        phone: authStaff.phone,
      })
    : staff[3];

  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [currentStaff] = useState<StaffMember>(initialStaff);

  function renderTab() {
    switch (activeTab) {
      case "dashboard": return <TabDashboard {...state} />;
      case "tables": return <TabTables {...state} />;
      case "orders": return <TabOrders {...state} />;
      case "kitchen": return <TabKitchen {...state} />;
      case "calls": return <TabCalls {...state} />;
      case "messages": return <TabMessages {...state} />;
      case "sales": return <TabSales {...state} />;
      case "staff": return <TabStaff {...state} />;
      case "inventory": return <TabInventory {...state} />;
      case "qr": return <TabQR {...state} />;
      case "menu": return <TabMenu {...state} />;
      case "reviews": return <TabReviews {...state} />;
      case "settings": return <TabSettings />;
      default: return null;
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {demoMode && (
        <div
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            background: "var(--amber)",
            color: "#000",
            borderRadius: 6,
            padding: "4px 12px",
            fontSize: 11,
            fontWeight: 700,
            zIndex: 200,
            letterSpacing: 0.5,
          }}
        >
          DEMO
        </div>
      )}
      <Sidebar
        activeTab={activeTab}
        setTab={setActiveTab}
        staffMember={currentStaff}
        demoMode={demoMode}
        setDemoMode={setDemoMode}
        onSignOut={onSignOut}
      />
      <main style={S.main}>{renderTab()}</main>
    </div>
  );
}
