"use client";

import { useMemo, useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const showcase = [
  {
    title: "Mesas QR",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1600&auto=format&fit=crop",
    desc: "El cliente escanea el QR desde la mesa, ve la carta, pide, llama al camarero, revisa el estado de su pedido y solicita la cuenta.",
  },
  {
    title: "Camareros conectados",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1600&auto=format&fit=crop",
    desc: "El equipo recibe llamados, pedidos y mensajes de cada mesa. Menos carreras, menos confusión y mejor atención.",
  },
  {
    title: "Cocina organizada",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1600&auto=format&fit=crop",
    desc: "La cocina ve los pedidos ordenados por estado: recibido, preparando, listo para servir y servido. Todo claro y en vivo.",
  },
  {
    title: "Autoservicio inteligente",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop",
    desc: "Tótems de autoservicio conectados a la misma carta, cocina, caja y administración. Ideal para comida rápida, cafés y alto flujo.",
  },
];

const modules = [
  { name: "VYKO Mesas",          eyebrow: "Cliente en mesa",     desc: "Carta digital, pedidos, llamado al camarero, solicitud de cobro, propina, reseñas y seguimiento del pedido desde un QR." },
  { name: "VYKO Camareros",      eyebrow: "Equipo de servicio",  desc: "Llamados de mesa, pedidos activos, mensajes del cliente, mesas asignadas y colaboración del administrador en tiempo real." },
  { name: "VYKO Cocina",         eyebrow: "Pantalla de cocina",  desc: "Pedidos organizados por estado para acelerar el servicio, reducir errores y mantener al equipo coordinado." },
  { name: "VYKO Administración", eyebrow: "Control total",       desc: "Ventas, empleados, carta, QR de mesas, inventario, propinas, caja, turnos, boletas, reportes y auditoría." },
  { name: "VYKO Inteligencia",   eyebrow: "IA práctica",         desc: "Asistencia inteligente para recomendaciones, alergias, automatizaciones, mensajes, operación y análisis del restaurante." },
  { name: "VYKO Analítica",      eyebrow: "Decisiones claras",   desc: "Métricas de ventas, platos más vendidos, propinas, rendimiento por camarero, tiempos de cocina y comportamiento por mesa." },
];

const benefits = [
  "Aumenta el ticket promedio con una carta visual, ordenada y fácil de usar.",
  "Reduce esperas entre cliente, camarero, cocina y caja.",
  "Centraliza pedidos, llamados, cobros, propinas, reseñas y boletas.",
  "Convierte cada mesa en una experiencia moderna y conectada.",
  "Permite operar con roles claros: administración, camareros, cocina y caja.",
  "Entrega una imagen premium y diferente frente a otros restaurantes.",
];

const plans = [
  {
    name: "Arranque",
    price: "USD 29",
    desc: "Perfecto para restaurantes que quieren dejar atrás el caos y comenzar a organizar toda la operación.",
    features: ["Administración completa","Panel de camareros","Pantalla de cocina","Pedidos en tiempo real","Caja y turnos","Boletas y propinas","Panel de ventas"],
  },
  {
    name: "Impulso",
    price: "USD 49",
    desc: "La experiencia completa para mesas QR y atención moderna dentro del restaurante.",
    features: ["Todo el plan Arranque","Mesas con QR","Carta digital premium","Llamado al camarero","Solicitud de cobro","Reseñas de clientes","Estado del pedido en vivo"],
    highlight: true,
  },
  {
    name: "Élite",
    price: "USD 99",
    desc: "Toda la potencia de VYKO con autoservicio, inteligencia artificial y operación avanzada.",
    features: ["Todo el plan Impulso","Tótem de autoservicio","IA en mesa","IA para administración","Recomendaciones inteligentes","Automatizaciones","Multi-sucursal","Analítica avanzada"],
  },
];

const stats = [
  ["Más rápido", "Pedidos y llamados llegan al instante"],
  ["4 roles",    "Administración, camareros, cocina y caja"],
  ["1 QR",       "Toda la experiencia desde la mesa"],
  ["En vivo",    "Operación sincronizada en tiempo real"],
];

const faqs = [
  { q: "¿VYKO reemplaza al camarero?",         a: "No. VYKO ayuda al equipo a trabajar mejor. El camarero sigue siendo clave para la atención, la experiencia humana y el cobro presencial cuando corresponde." },
  { q: "¿Funciona con QR por mesa?",           a: "Sí. Cada mesa tiene un QR único. El cliente entra directamente a la experiencia de su mesa y todo queda conectado con pedidos, cocina, camareros y administración." },
  { q: "¿Puedo agregar o editar platos?",      a: "Sí. Desde administración puedes crear platos, cambiar precios, subir imágenes, activar o desactivar disponibilidad y decidir qué ve el cliente." },
  { q: "¿El sistema incluye propinas y caja?", a: "Sí. VYKO permite registrar propinas aceptadas o rechazadas, abrir caja, cerrar caja, cambiar turnos, imprimir cierres y revisar reportes." },
  { q: "¿Sirve para comida rápida o cafés?",   a: "Sí. Con el módulo de autoservicio puedes usar tótems conectados a la misma carta, cocina, caja y administración." },
  { q: "¿La inteligencia artificial está incluida?", a: "La inteligencia avanzada está incluida en el plan Élite. Puede ayudar con recomendaciones, automatizaciones, respuestas y análisis del restaurante." },
  { q: "¿Cuánto tiempo tarda en implementarse?", a: "El sistema está listo al instante. Tras el registro creas tu cuenta, cargas tu carta y en minutos tienes el QR de cada mesa operativo." },
  { q: "¿Necesito hardware especial?",           a: "No. VYKO funciona desde cualquier navegador en tablet, celular o computadora. No requiere instalación ni equipos adicionales." },
];

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');
:root{--bg:#060605;--panel:#11100e;--panel2:#181613;--line:rgba(255,255,255,.1);--text:#fff8ed;--muted:#c0b3a2;--dim:#7a7065;--gold:#c8a96b;--gold2:#f0d48d;--green:#34d399;--red:#f87171;--shadow:0 28px 90px rgba(0,0,0,.48)}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% -8%,rgba(200,169,107,.25),transparent 32%),radial-gradient(circle at 100% 18%,rgba(255,255,255,.08),transparent 28%),#050504;color:var(--text);font-family:Inter,system-ui,sans-serif}a{color:inherit;text-decoration:none}.page{overflow:hidden}
.container{width:min(1180px,calc(100% - 32px));margin:auto}
.nav{position:sticky;top:0;z-index:40;background:rgba(6,6,5,.72);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}.nav-in{height:76px;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{font-family:'Playfair Display',serif;font-size:31px;letter-spacing:.18em;color:var(--gold2);line-height:.9}.brand small{display:block;font-family:Inter;font-size:9px;letter-spacing:.26em;color:var(--muted);margin-top:7px}.nav-links{display:flex;align-items:center;gap:20px;color:var(--muted);font-weight:800;font-size:13px}
.btn{border:0;border-radius:16px;padding:13px 20px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:9px;font-size:14px;transition:opacity .15s}.btn:disabled{opacity:.5;cursor:not-allowed}.btn.primary{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#151007;box-shadow:0 18px 40px rgba(200,169,107,.22)}.btn.ghost{background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--text)}.btn.danger{background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.3);color:var(--red)}
.hero{position:relative;padding:92px 0 60px}.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:38px;align-items:center}.eyebrow{color:var(--gold2);font-weight:900;letter-spacing:.13em;font-size:12px;text-transform:uppercase}.hero h1{font-family:'Playfair Display',serif;font-size:76px;line-height:.9;letter-spacing:-.07em;margin:16px 0}.hero p{color:var(--muted);font-size:18px;line-height:1.7;max-width:650px}.cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.trust{display:flex;gap:18px;flex-wrap:wrap;margin-top:28px;color:var(--dim);font-size:13px;font-weight:800}.trust span{display:flex;gap:8px;align-items:center}.dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 5px rgba(52,211,153,.12)}
.device{position:relative;border-radius:36px;padding:16px;background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.025));border:1px solid var(--line);box-shadow:var(--shadow)}.device-screen{min-height:610px;border-radius:28px;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.78)),url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1400&auto=format&fit=crop') center/cover;overflow:hidden;padding:18px;display:flex;flex-direction:column;justify-content:space-between}.screen-top{display:flex;justify-content:space-between;align-items:center}.pill{border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.28);border-radius:999px;padding:9px 12px;font-size:12px;font-weight:900}.screen-card{border-radius:24px;background:rgba(11,10,9,.78);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(16px);padding:16px}.screen-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.mini{border-radius:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.08);padding:13px;min-height:80px}.mini b{display:block}.mini small{display:block;color:var(--muted);margin-top:6px;line-height:1.35}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:32px 0 0}.stat{border-radius:22px;background:rgba(255,255,255,.045);border:1px solid var(--line);padding:18px}.stat b{font-size:27px;color:var(--gold2)}.stat span{display:block;color:var(--muted);font-size:13px;margin-top:6px}
.section{padding:78px 0}.section-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:24px}.section h2{font-family:'Playfair Display',serif;font-size:52px;line-height:.96;letter-spacing:-.05em;margin:0}.section-head p{color:var(--muted);max-width:480px;line-height:1.65}
.modules{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{border-radius:26px;background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.025));border:1px solid var(--line);box-shadow:0 16px 50px rgba(0,0,0,.22);padding:20px}.card .label{font-size:11px;color:var(--gold2);letter-spacing:.14em;text-transform:uppercase;font-weight:900}.card h3{font-size:23px;margin:11px 0 8px}.card p{color:var(--muted);line-height:1.55;font-size:14px}
.showcase-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.showcase-card{position:relative;overflow:hidden;border-radius:30px;min-height:420px;border:1px solid var(--line);box-shadow:var(--shadow);background:#111}.showcase-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.58)}.showcase-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.88));padding:26px;display:flex;flex-direction:column;justify-content:flex-end}.showcase-overlay h3{font-family:'Playfair Display',serif;font-size:36px;line-height:.95;margin:0 0 10px}.showcase-overlay p{color:#ddd1c0;line-height:1.6;max-width:440px}
.split{display:grid;grid-template-columns:.95fr 1.05fr;gap:18px;align-items:start}.benefits{display:grid;gap:10px}.benefit{display:flex;gap:12px;align-items:flex-start;border-radius:18px;background:rgba(255,255,255,.045);border:1px solid var(--line);padding:14px;color:#eadfce;line-height:1.5}.check{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:rgba(52,211,153,.13);color:var(--green);font-weight:900;flex:0 0 auto}
.demo-panel{border-radius:30px;background:linear-gradient(145deg,rgba(200,169,107,.12),rgba(255,255,255,.035));border:1px solid rgba(200,169,107,.2);padding:22px;box-shadow:var(--shadow)}.timeline{display:grid;gap:12px;margin-top:18px}.step{display:grid;grid-template-columns:36px 1fr;gap:12px;align-items:start}.num{width:36px;height:36px;border-radius:14px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#151007;display:grid;place-items:center;font-weight:900}.step b{display:block}.step span{display:block;color:var(--muted);font-size:13px;margin-top:4px;line-height:1.45}
.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.plan{position:relative}.plan.highlight{border-color:rgba(240,212,141,.38);background:linear-gradient(145deg,rgba(200,169,107,.14),rgba(255,255,255,.03))}.tag{position:absolute;top:14px;right:14px;border-radius:999px;background:rgba(52,211,153,.13);color:var(--green);font-size:11px;padding:7px 10px;font-weight:900}.price{font-size:34px;font-weight:900;color:var(--gold2);margin:14px 0}.features{display:grid;gap:10px;margin:18px 0}.features div{color:var(--muted);font-size:14px}
.reg-tabs{display:flex;gap:8px;margin-bottom:20px}.reg-tab{flex:1;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--muted);border-radius:14px;padding:11px;font-weight:800;font-size:14px;cursor:pointer}.reg-tab.active{background:linear-gradient(135deg,rgba(200,169,107,.18),rgba(200,169,107,.06));border-color:rgba(200,169,107,.4);color:var(--gold2)}
.form-row{display:grid;gap:10px}.field{display:grid;gap:5px}.field label{font-size:12px;font-weight:700;color:var(--muted);letter-spacing:.04em}.field input{width:100%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:#fff8ed;border-radius:14px;padding:13px 15px;outline:none;font:inherit;font-size:14px;transition:border-color .15s}.field input:focus{border-color:rgba(200,169,107,.5)}.field input.err{border-color:rgba(248,113,113,.5)}.form-error{color:var(--red);font-size:13px;padding:10px 14px;border-radius:12px;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2)}.form-hint{color:var(--dim);font-size:12px;line-height:1.5;margin-top:6px}
.success-box{text-align:center;padding:10px 0}.success-icon{font-size:52px;margin-bottom:12px}.success-box h3{font-family:'Playfair Display',serif;font-size:28px;margin:0 0 10px}.success-box p{color:var(--muted);line-height:1.6;font-size:14px;margin:0 0 20px}.success-rid{font-size:12px;color:var(--dim);font-family:monospace;background:rgba(255,255,255,.06);border-radius:10px;padding:8px 12px;display:inline-block;margin-bottom:20px}
.faq-accordion{display:grid;gap:14px}.faq-item{border-radius:22px;border:1px solid var(--line);background:rgba(255,255,255,.04);overflow:hidden}.faq-btn{width:100%;background:none;border:0;color:var(--text);display:flex;justify-content:space-between;align-items:center;padding:22px;font-size:18px;font-weight:800;cursor:pointer;text-align:left}.faq-answer{padding:0 22px 22px;color:var(--muted);line-height:1.7;font-size:15px}.faq-icon{font-size:26px;color:var(--gold2);flex:0 0 auto}
.final{padding:86px 0 100px;text-align:center}.final-box{border-radius:36px;background:radial-gradient(circle at 50% 0,rgba(200,169,107,.24),transparent 42%),linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025));border:1px solid var(--line);padding:58px 20px;box-shadow:var(--shadow)}.final h2{font-family:'Playfair Display',serif;font-size:62px;line-height:.95;letter-spacing:-.05em;margin:0 0 18px}
.footer{border-top:1px solid var(--line);padding:28px 0;color:var(--dim);font-size:13px}.footer-in{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
@media(max-width:900px){.showcase-grid{grid-template-columns:1fr}.showcase-card{min-height:360px}.nav-links a{display:none}.hero{padding:54px 0 34px}.hero-grid,.split{grid-template-columns:1fr}.hero h1{font-size:54px}.device-screen{min-height:520px}.stats,.modules,.plans{grid-template-columns:1fr}.section{padding:54px 0}.section-head{display:block}.section h2,.final h2{font-size:42px}.nav-in{height:68px}.brand{font-size:25px}}
`;

// ─── Registration form ────────────────────────────────────────────────────────

interface RegisterProps { n8nBase: string; adminUrl: string }

type Step = "form" | "sending" | "success" | "error";

function RegisterForm({ n8nBase, adminUrl }: RegisterProps) {
  const [fields, setFields] = useState({ restaurantName: "", ownerName: "", email: "", password: "", confirm: "" });
  const [step, setStep]   = useState<Step>("form");
  const [errMsg, setErrMsg] = useState("");
  const [rid, setRid] = useState("");

  function set(k: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setFields(f => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg("");
    if (!fields.restaurantName.trim() || !fields.ownerName.trim() || !fields.email.trim() || !fields.password) {
      setErrMsg("Completa todos los campos obligatorios.");
      return;
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(fields.email)) {
      setErrMsg("El correo no es válido.");
      return;
    }
    if (fields.password.length < 8) {
      setErrMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (fields.password !== fields.confirm) {
      setErrMsg("Las contraseñas no coinciden.");
      return;
    }

    const endpoint = `${n8nBase}/webhook/restaurant-onboard`;
    if (!n8nBase) {
      setErrMsg("El servicio de registro no está configurado. Contacta al soporte.");
      return;
    }

    setStep("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: fields.restaurantName.trim(),
          ownerName:      fields.ownerName.trim(),
          ownerEmail:     fields.email.trim().toLowerCase(),
          ownerPassword:  fields.password,
        }),
      });
      const data = await res.json() as { ok?: boolean; restaurant_id?: string; error?: string };
      if (!res.ok || !data.ok) {
        setStep("error");
        setErrMsg(data.error ?? "No pudimos crear tu cuenta. Intenta de nuevo.");
        return;
      }
      setRid(data.restaurant_id ?? "");
      setStep("success");
    } catch {
      setStep("error");
      setErrMsg("Error de conexión. Verifica tu internet e intenta de nuevo.");
    }
  }

  if (step === "success") {
    return (
      <div className="success-box">
        <div className="success-icon">🎉</div>
        <h3>¡Cuenta creada!</h3>
        <p>Tu restaurante ya está en VYKO. Inicia sesión con el correo y contraseña que ingresaste.</p>
        {rid && <div className="success-rid">ID: {rid}</div>}
        <a className="btn primary" href={adminUrl || "#"} style={{ width: "100%" }}>
          Ir al panel de administración →
        </a>
        <div className="form-hint" style={{ marginTop: 14 }}>
          Recibirás un correo de bienvenida en breve con más información.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="form-row">
      <div className="field">
        <label>Nombre del restaurante *</label>
        <input placeholder="Ej: La Trattoria" value={fields.restaurantName} onChange={set("restaurantName")} />
      </div>
      <div className="field">
        <label>Tu nombre *</label>
        <input placeholder="Ej: Carlos Pérez" value={fields.ownerName} onChange={set("ownerName")} />
      </div>
      <div className="field">
        <label>Correo electrónico *</label>
        <input type="email" placeholder="tu@correo.com" value={fields.email} onChange={set("email")} />
      </div>
      <div className="field">
        <label>Contraseña *</label>
        <input type="password" placeholder="Mínimo 8 caracteres" value={fields.password} onChange={set("password")} />
      </div>
      <div className="field">
        <label>Confirmar contraseña *</label>
        <input type="password" placeholder="Repite la contraseña" value={fields.confirm} onChange={set("confirm")} />
      </div>
      {(step === "error" || errMsg) && <div className="form-error">{errMsg}</div>}
      <button type="submit" className="btn primary" disabled={step === "sending"} style={{ width: "100%", marginTop: 4 }}>
        {step === "sending" ? "Creando cuenta…" : "Crear mi cuenta gratis"}
      </button>
      <div className="form-hint">
        Al crear tu cuenta aceptas los términos de uso. Sin permanencia, cancela cuando quieras.
      </div>
    </form>
  );
}

// ─── WhatsApp demo form ───────────────────────────────────────────────────────

function WhatsappForm() {
  const [lead, setLead] = useState({ name: "", restaurant: "", whatsapp: "" });
  function set(k: keyof typeof lead) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setLead(l => ({ ...l, [k]: e.target.value }));
  }
  const href = useMemo(() => {
    const text = encodeURIComponent(`Hola, quiero una demo de VYKO.\nNombre: ${lead.name || "—"}\nRestaurante: ${lead.restaurant || "—"}\nWhatsApp: ${lead.whatsapp || "—"}`);
    return `https://wa.me/?text=${text}`;
  }, [lead]);

  return (
    <div className="form-row">
      <p style={{ color: "var(--muted)", margin: "0 0 8px", lineHeight: 1.6 }}>
        Completa estos datos y te abrimos WhatsApp con el mensaje listo para solicitar una demo personalizada.
      </p>
      <div className="field">
        <label>Tu nombre</label>
        <input placeholder="Nombre" value={lead.name} onChange={set("name")} />
      </div>
      <div className="field">
        <label>Nombre del restaurante</label>
        <input placeholder="La Trattoria" value={lead.restaurant} onChange={set("restaurant")} />
      </div>
      <div className="field">
        <label>WhatsApp</label>
        <input placeholder="+56 9 1234 5678" value={lead.whatsapp} onChange={set("whatsapp")} />
      </div>
      <a className="btn primary" href={href} target="_blank" rel="noreferrer" style={{ width: "100%" }}>
        Abrir WhatsApp
      </a>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { n8nBase: string; adminUrl: string }

export default function Landing({ n8nBase, adminUrl }: Props) {
  const [openFaq, setOpenFaq]   = useState(0);
  const [regTab,  setRegTab]    = useState<"register" | "demo">("register");

  return (
    <div className="page">
      <style>{CSS}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="container nav-in">
          <a href="#top" className="brand">
            VYKO
            <small>Sistema inteligente para restaurantes</small>
          </a>
          <div className="nav-links">
            <a href="#modulos">Módulos</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#precios">Planes</a>
            <a href="#faq">Preguntas</a>
            <a className="btn primary" href="#cuenta">Comenzar gratis</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header id="top" className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Restaurantes inteligentes · Atención moderna · Operación en tiempo real</div>
            <h1>El sistema que pone orden en tu restaurante.</h1>
            <p>VYKO fue creado para acabar con el caos operativo de los restaurantes. Pedidos perdidos, camareros corriendo, cocina desordenada, clientes esperando la cuenta y múltiples sistemas desconectados. Todo queda conectado en una sola plataforma simple, elegante y fácil de usar.</p>
            <div className="cta-row">
              <a className="btn primary" href="#cuenta">Crear cuenta gratis</a>
              <a className="btn ghost" href="#modulos">Descubrir el sistema</a>
            </div>
            <div className="trust">
              <span><i className="dot" />Seguro y en la nube</span>
              <span><i className="dot" />Sin instalación</span>
              <span><i className="dot" />Listo en minutos</span>
            </div>
          </div>

          <div className="device">
            <div className="device-screen">
              <div className="screen-top">
                <div className="brand" style={{ fontSize: 23 }}>VYKO<small>MESA DIGITAL</small></div>
                <span className="pill">Mesa 7</span>
              </div>
              <div className="screen-card">
                <div className="eyebrow">Mesa conectada · Salón</div>
                <h3 style={{ fontFamily: "Playfair Display", fontSize: 38, margin: "10px 0 8px", lineHeight: 1 }}>Todo desde la mesa</h3>
                <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>Carta, pedido, camarero, cuenta, reseña y estado de cocina.</p>
                <div className="screen-actions">
                  <div className="mini"><b>Carta</b><small>Visual, rápida y editable.</small></div>
                  <div className="mini"><b>Camarero</b><small>Llamados y mensajes en vivo.</small></div>
                  <div className="mini"><b>Cocina</b><small>Estado del pedido en tiempo real.</small></div>
                  <div className="mini"><b>Cuenta</b><small>Solicitar cobro y propina.</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container stats">
          {stats.map(([value, label]) => (
            <div className="stat" key={value}><b>{value}</b><span>{label}</span></div>
          ))}
        </div>
      </header>

      {/* MÓDULOS */}
      <section id="modulos" className="section">
        <div className="container">
          <div className="section-head">
            <h2>Mucho más que un menú digital.</h2>
            <p>Cada área del restaurante trabaja conectada: mesas, camareros, cocina, caja, administración y autoservicio. Todo sincronizado en tiempo real desde una sola plataforma.</p>
          </div>
          <div className="modules">
            {modules.map(m => (
              <article className="card" key={m.name}>
                <span className="label">{m.eyebrow}</span>
                <h3>{m.name}</h3>
                <p>{m.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Todo el restaurante trabajando en armonía.</h2>
            <p>Desde el cliente que escanea un QR hasta la cocina que prepara el plato, todos ven lo que necesitan en tiempo real y sin complicaciones.</p>
          </div>
          <div className="showcase-grid">
            {showcase.map(item => (
              <article className="showcase-card" key={item.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} />
                <div className="showcase-overlay">
                  <div className="eyebrow">Experiencia VYKO</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="section">
        <div className="container split">
          <div>
            <div className="eyebrow">Por qué VYKO</div>
            <h2>Menos estrés. Más control. Mejor servicio.</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>VYKO fue pensado para que cualquier restaurante pueda trabajar más rápido, atender mejor y controlar todo desde un solo lugar sin sistemas complicados.</p>
          </div>
          <div className="benefits">
            {benefits.map(b => (
              <div className="benefit" key={b}><span className="check">✓</span><span>{b}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="section">
        <div className="container split">
          <div className="demo-panel">
            <div className="eyebrow">Flujo real</div>
            <h2 style={{ fontSize: 42 }}>Todo conectado en tiempo real.</h2>
            <div className="timeline">
              <div className="step"><span className="num">1</span><div><b>Cliente escanea QR</b><span>El cliente entra automáticamente a la experiencia de su mesa.</span></div></div>
              <div className="step"><span className="num">2</span><div><b>Cliente pide o llama al camarero</b><span>Los pedidos, llamados y solicitudes llegan al instante.</span></div></div>
              <div className="step"><span className="num">3</span><div><b>Cocina y equipo reciben en vivo</b><span>La cocina recibe pedidos organizados para evitar errores y retrasos.</span></div></div>
              <div className="step"><span className="num">4</span><div><b>Administración controla todo</b><span>Ventas, propinas, turnos, boletas y rendimiento quedan registrados.</span></div></div>
            </div>
          </div>
          <div className="card">
            <span className="label">Diferencia clave</span>
            <h3>La tecnología ayuda al servicio, no lo reemplaza.</h3>
            <p>El cliente puede pedir ayuda, revisar pedidos o solicitar la cuenta desde su mesa mientras el equipo mantiene una atención cercana y profesional.</p>
            <p>El resultado es un restaurante más rápido, organizado y moderno sin perder la experiencia humana.</p>
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" className="section">
        <div className="container">
          <div className="section-head">
            <h2>Planes pensados para cada tipo de restaurante.</h2>
            <p>Sin instalación complicada. Sin equipos especiales. Empieza en minutos desde cualquier navegador.</p>
          </div>
          <div className="plans">
            {plans.map(plan => (
              <article className={`card plan ${plan.highlight ? "highlight" : ""}`} key={plan.name}>
                {plan.highlight && <span className="tag">Recomendado</span>}
                <h3>{plan.name}</h3>
                <div className="price">{plan.price}<small style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}> / mes</small></div>
                <p>{plan.desc}</p>
                <div className="features">{plan.features.map(f => <div key={f}>✓ {f}</div>)}</div>
                <a className={plan.highlight ? "btn primary" : "btn ghost"} href="#cuenta" style={{ width: "100%" }}>Comenzar</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRO / DEMO */}
      <section id="cuenta" className="section">
        <div className="container split">
          <div>
            <div className="eyebrow">Únete a VYKO</div>
            <h2>Crea tu cuenta y empieza hoy.</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              El registro tarda menos de 2 minutos. Ingresa el nombre de tu restaurante, tu correo y una contraseña. Tu cuenta queda lista al instante y puedes comenzar a cargar tu carta y configurar tus mesas de inmediato.
            </p>
            <div style={{ marginTop: 28, display: "grid", gap: 10 }}>
              <div className="benefit"><span className="check">✓</span><span>Cuenta lista al instante — sin esperas</span></div>
              <div className="benefit"><span className="check">✓</span><span>QR de mesas generados automáticamente</span></div>
              <div className="benefit"><span className="check">✓</span><span>Panel de administración disponible de inmediato</span></div>
            </div>
          </div>

          <div className="card">
            <div className="reg-tabs">
              <button type="button" className={`reg-tab ${regTab === "register" ? "active" : ""}`} onClick={() => setRegTab("register")}>
                Crear cuenta
              </button>
              <button type="button" className={`reg-tab ${regTab === "demo" ? "active" : ""}`} onClick={() => setRegTab("demo")}>
                Solicitar demo
              </button>
            </div>
            {regTab === "register"
              ? <RegisterForm n8nBase={n8nBase} adminUrl={adminUrl} />
              : <WhatsappForm />
            }
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="container">
          <div className="section-head">
            <h2>Preguntas frecuentes</h2>
            <p>Estas son algunas de las dudas más comunes antes de implementar el sistema.</p>
          </div>
          <div className="faq-accordion">
            {faqs.map((faq, index) => (
              <div className="faq-item" key={faq.q}>
                <button className="faq-btn" type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                  <span>{faq.q}</span>
                  <span className="faq-icon">{openFaq === index ? "−" : "+"}</span>
                </button>
                {openFaq === index && <div className="faq-answer">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final">
        <div className="container">
          <div className="final-box">
            <div className="eyebrow">Sistema inteligente para restaurantes</div>
            <h2>El caos del restaurante termina aquí.</h2>
            <p style={{ color: "var(--muted)", maxWidth: 620, margin: "14px auto 28px", lineHeight: 1.7 }}>
              Todo el restaurante conectado en una plataforma simple, rápida y fácil de usar. Menos errores, menos estrés y una mejor experiencia para clientes y equipo.
            </p>
            <a className="btn primary" href="#cuenta">Crear cuenta gratis</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-in">
          <span>© {new Date().getFullYear()} VYKO. Sistema inteligente para restaurantes.</span>
          <span>Mesas · Camareros · Cocina · Administración · IA · Analítica</span>
        </div>
      </footer>
    </div>
  );
}
