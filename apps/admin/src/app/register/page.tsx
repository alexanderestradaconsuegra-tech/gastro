"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.restaurantName.trim() || !form.ownerName.trim() || !form.email.trim() || !form.password) {
      setError("Completa todos los campos");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (form.password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: form.restaurantName,
          ownerName: form.ownerName,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Error al registrar");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Error de conexión, intenta de nuevo");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={S.root}>
        <div style={S.card}>
          <div style={S.checkIcon}>✓</div>
          <h2 style={S.successTitle}>¡Restaurante creado!</h2>
          <p style={S.successText}>
            Tu cuenta está lista. Inicia sesión con tu correo y contraseña.
          </p>
          <button style={S.btn} onClick={() => router.push("/")}>
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.root}>
      <div style={S.card}>
        <div style={S.header}>
          <span style={S.logo}>HOLU</span>
          <span style={S.subtitle}>Crear restaurante</span>
        </div>

        <form onSubmit={handleSubmit} style={S.form}>
          <label style={S.label}>Nombre del restaurante</label>
          <input
            name="restaurantName"
            value={form.restaurantName}
            onChange={handleChange}
            placeholder="Ej: La Buona Pasta"
            style={S.input}
            autoComplete="off"
          />

          <label style={S.label}>Tu nombre</label>
          <input
            name="ownerName"
            value={form.ownerName}
            onChange={handleChange}
            placeholder="Nombre completo del propietario"
            style={S.input}
            autoComplete="name"
          />

          <label style={S.label}>Correo electrónico</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@miemail.com"
            style={S.input}
            autoComplete="email"
          />

          <label style={S.label}>Contraseña (PIN de acceso)</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mínimo 4 caracteres"
            style={S.input}
            autoComplete="new-password"
          />

          <label style={S.label}>Confirmar contraseña</label>
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repite la contraseña"
            style={S.input}
            autoComplete="new-password"
          />

          {error && <p style={S.error}>{error}</p>}

          <button type="submit" style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
            {loading ? "Creando cuenta…" : "Crear restaurante"}
          </button>
        </form>

        <p style={S.footerText}>
          ¿Ya tienes cuenta?{" "}
          <button style={S.link} onClick={() => router.push("/")}>
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
}

const S = {
  root: {
    minHeight: "100vh",
    background: "#0f0f0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  } as React.CSSProperties,
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 16,
    padding: 36,
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
    color: "#666",
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: "#888",
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: 0.5,
  } as React.CSSProperties,
  input: {
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "11px 14px",
    color: "#eee",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  error: {
    color: "#e55",
    fontSize: 13,
    marginTop: 8,
    marginBottom: 0,
    textAlign: "center" as const,
  },
  btn: {
    marginTop: 20,
    padding: "13px 0",
    background: "#c9a84c",
    color: "#000",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    letterSpacing: 0.5,
  } as React.CSSProperties,
  footerText: {
    textAlign: "center" as const,
    marginTop: 20,
    fontSize: 13,
    color: "#666",
  },
  link: {
    background: "none",
    border: "none",
    color: "#c9a84c",
    cursor: "pointer",
    fontSize: 13,
    padding: 0,
    textDecoration: "underline",
  } as React.CSSProperties,
  checkIcon: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#1a3a2a",
    border: "1.5px solid #4cc98f55",
    color: "#4cc98f",
    fontSize: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  } as React.CSSProperties,
  successTitle: {
    textAlign: "center" as const,
    color: "#eee",
    fontSize: 22,
    fontWeight: 700,
    margin: "0 0 12px",
  },
  successText: {
    textAlign: "center" as const,
    color: "#888",
    fontSize: 14,
    lineHeight: 1.6,
    margin: "0 0 24px",
  },
};
