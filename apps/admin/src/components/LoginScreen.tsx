"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StaffRole } from "@/lib/constants";

interface StaffOption {
  name: string;
  email: string;
  role: StaffRole;
  initials: string;
}

const STAFF_OPTIONS: StaffOption[] = [
  { name: "Valentina Cruz", email: "admin@nido.cl",    role: "admin",    initials: "VC" },
  { name: "Marco Ferrán",   email: "marco@nido.cl",    role: "camarero", initials: "MF" },
  { name: "Isabella Ruiz",  email: "isabella@nido.cl", role: "camarero", initials: "IR" },
  { name: "Tomás Vera",     email: "tomas@nido.cl",    role: "camarero", initials: "TV" },
  { name: "Chef Roberto",   email: "cocina@nido.cl",   role: "cocina",   initials: "CR" },
  { name: "Ana Soto",       email: "caja@nido.cl",     role: "caja",     initials: "AS" },
];

const ROLE_COLOR: Record<StaffRole, string> = {
  admin:    "#c9a84c",
  camarero: "#4c8fc9",
  cocina:   "#c94c4c",
  caja:     "#4cc98f",
};

const PIN_KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

interface Props {
  onLogin: (email: string, pin: string) => Promise<{ ok: boolean; error?: string }>;
  loading: boolean;
}

export default function LoginScreen({ onLogin, loading }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<StaffOption | null>(null);
  const [pin, setPin]           = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [emailMode, setEmailMode] = useState(false);
  const [emailVal, setEmailVal]   = useState("");
  const [passVal, setPassVal]     = useState("");

  const handleKey = (k: string) => {
    if (k === "⌫") {
      setPin((p) => p.slice(0, -1));
      setError(null);
      return;
    }
    if (pin.length >= 4) return;
    const next = pin + k;
    setPin(next);
    setError(null);
    if (next.length === 4 && selected) {
      onLogin(selected.email, next).then(({ ok, error: e }) => {
        if (!ok) {
          setError(e ?? "PIN incorrecto");
          setPin("");
        }
      });
    }
  };

  const handleSelect = (s: StaffOption) => {
    setSelected(s);
    setPin("");
    setError(null);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVal.trim() || !passVal) return;
    const { ok, error: e2 } = await onLogin(emailVal.trim().toLowerCase(), passVal);
    if (!ok) setError(e2 ?? "Credenciales incorrectas");
  };

  return (
    <div style={S.root}>
      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <span style={S.logo}>HOLU</span>
          <span style={S.subtitle}>Panel de gestión</span>
        </div>

        {emailMode ? (
          /* ── Email / password login ──────────────────────── */
          <>
            <button style={S.back} onClick={() => { setEmailMode(false); setError(null); setEmailVal(""); setPassVal(""); }}>
              ← Volver
            </button>
            <p style={S.prompt}>Acceso con correo</p>
            <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="email"
                value={emailVal}
                onChange={(e) => { setEmailVal(e.target.value); setError(null); }}
                placeholder="correo@ejemplo.com"
                style={S.emailInput}
                autoComplete="email"
              />
              <input
                type="password"
                value={passVal}
                onChange={(e) => { setPassVal(e.target.value); setError(null); }}
                placeholder="Contraseña / PIN"
                style={S.emailInput}
                autoComplete="current-password"
              />
              {error && <p style={S.error}>{error}</p>}
              <button
                type="submit"
                style={{ ...S.emailBtn, opacity: loading ? 0.6 : 1 }}
                disabled={loading}
              >
                {loading ? "Verificando…" : "Entrar"}
              </button>
            </form>
          </>
        ) : !selected ? (
          /* ── Staff selector ──────────────────────────────── */
          <>
            <p style={S.prompt}>¿Quién eres?</p>
            <div style={S.grid}>
              {STAFF_OPTIONS.map((s) => (
                <button key={s.email} style={S.staffBtn} onClick={() => handleSelect(s)}>
                  <span
                    style={{
                      ...S.avatar,
                      background: ROLE_COLOR[s.role] + "22",
                      border: `1.5px solid ${ROLE_COLOR[s.role]}55`,
                      color: ROLE_COLOR[s.role],
                    }}
                  >
                    {s.initials}
                  </span>
                  <span style={S.staffName}>{s.name}</span>
                  <span
                    style={{
                      ...S.roleBadge,
                      background: ROLE_COLOR[s.role] + "22",
                      color: ROLE_COLOR[s.role],
                    }}
                  >
                    {s.role}
                  </span>
                </button>
              ))}
            </div>
            <div style={S.ownerSection}>
              <button style={S.ownerBtn} onClick={() => setEmailMode(true)}>
                Propietario / Admin — acceso con correo
              </button>
              <button style={S.registerLink} onClick={() => router.push("/register")}>
                ¿Primera vez? Crear restaurante →
              </button>
            </div>
          </>
        ) : (
          /* ── PIN pad ─────────────────────────────────────── */
          <>
            <button style={S.back} onClick={() => { setSelected(null); setPin(""); setError(null); }}>
              ← Volver
            </button>

            <div style={S.staffInfo}>
              <span
                style={{
                  ...S.avatar,
                  background: ROLE_COLOR[selected.role] + "22",
                  border: `1.5px solid ${ROLE_COLOR[selected.role]}55`,
                  color: ROLE_COLOR[selected.role],
                  fontSize: 20,
                  width: 52,
                  height: 52,
                }}
              >
                {selected.initials}
              </span>
              <div>
                <div style={S.staffName}>{selected.name}</div>
                <div
                  style={{
                    ...S.roleBadge,
                    background: ROLE_COLOR[selected.role] + "22",
                    color: ROLE_COLOR[selected.role],
                    display: "inline-block",
                    marginTop: 4,
                  }}
                >
                  {selected.role}
                </div>
              </div>
            </div>

            <p style={S.prompt}>Introduce tu PIN</p>

            {/* PIN dots */}
            <div style={S.dots}>
              {[0,1,2,3].map((i) => (
                <span
                  key={i}
                  style={{
                    ...S.dot,
                    background: i < pin.length
                      ? ROLE_COLOR[selected.role]
                      : "var(--line, #333)",
                    transform: i < pin.length ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            {error && <p style={S.error}>{error}</p>}

            {/* Keypad */}
            <div style={S.keypad}>
              {PIN_KEYS.map((k, i) => (
                k === "" ? (
                  <span key={i} />
                ) : (
                  <button
                    key={i}
                    style={{
                      ...S.key,
                      opacity: loading ? 0.5 : 1,
                      background: k === "⌫" ? "transparent" : "var(--panel2, #1a1a1a)",
                    }}
                    onClick={() => !loading && handleKey(k)}
                    disabled={loading}
                  >
                    {k}
                  </button>
                )
              ))}
            </div>

            {loading && <p style={S.loadingMsg}>Verificando…</p>}
          </>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
  root: {
    minHeight: "100vh",
    background: "var(--bg, #0f0f0f)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  } as React.CSSProperties,
  card: {
    background: "var(--panel, #1a1a1a)",
    border: "1px solid var(--line, #2a2a2a)",
    borderRadius: 16,
    padding: 32,
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
  } as React.CSSProperties,
  header: {
    textAlign: "center" as const,
    marginBottom: 28,
  },
  logo: {
    display: "block",
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 6,
    color: "#c9a84c",
  } as React.CSSProperties,
  subtitle: {
    fontSize: 12,
    color: "var(--dim, #666)",
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  prompt: {
    textAlign: "center" as const,
    fontSize: 14,
    color: "var(--dim, #888)",
    marginBottom: 20,
    marginTop: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  } as React.CSSProperties,
  staffBtn: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 6,
    padding: "14px 10px",
    background: "var(--panel2, #111)",
    border: "1px solid var(--line, #2a2a2a)",
    borderRadius: 10,
    cursor: "pointer",
    transition: "border-color 0.15s",
  } as React.CSSProperties,
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    transition: "transform 0.15s",
  } as React.CSSProperties,
  staffName: {
    fontSize: 13,
    color: "var(--text, #eee)",
    fontWeight: 500,
    textAlign: "center" as const,
  },
  roleBadge: {
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 4,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  } as React.CSSProperties,
  back: {
    background: "none",
    border: "none",
    color: "var(--dim, #666)",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
    marginBottom: 20,
    display: "block",
  } as React.CSSProperties,
  staffInfo: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
    padding: "12px 16px",
    background: "var(--panel2, #111)",
    borderRadius: 10,
    border: "1px solid var(--line, #2a2a2a)",
  } as React.CSSProperties,
  dots: {
    display: "flex",
    justifyContent: "center",
    gap: 14,
    marginBottom: 8,
  } as React.CSSProperties,
  dot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    transition: "background 0.1s, transform 0.1s",
  } as React.CSSProperties,
  error: {
    textAlign: "center" as const,
    color: "#e55",
    fontSize: 13,
    margin: "8px 0 0",
  },
  keypad: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginTop: 20,
  } as React.CSSProperties,
  key: {
    padding: "16px 0",
    fontSize: 20,
    fontWeight: 500,
    border: "1px solid var(--line, #2a2a2a)",
    borderRadius: 10,
    cursor: "pointer",
    color: "var(--text, #eee)",
    transition: "opacity 0.1s",
    userSelect: "none" as const,
  } as React.CSSProperties,
  loadingMsg: {
    textAlign: "center" as const,
    fontSize: 13,
    color: "var(--dim, #888)",
    marginTop: 12,
  },
  ownerSection: {
    marginTop: 20,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 10,
    borderTop: "1px solid var(--line, #2a2a2a)",
    paddingTop: 16,
  },
  ownerBtn: {
    background: "none",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#888",
    fontSize: 12,
    cursor: "pointer",
    padding: "9px 16px",
    width: "100%",
    transition: "border-color 0.15s",
  } as React.CSSProperties,
  registerLink: {
    background: "none",
    border: "none",
    color: "#c9a84c",
    fontSize: 12,
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
  } as React.CSSProperties,
  emailInput: {
    background: "var(--panel2, #111)",
    border: "1px solid var(--line, #2a2a2a)",
    borderRadius: 8,
    padding: "11px 14px",
    color: "var(--text, #eee)",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  emailBtn: {
    padding: "13px 0",
    background: "#c9a84c",
    color: "#000",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    marginTop: 4,
  } as React.CSSProperties,
};
