"use client";

import { useState } from "react";

const socialProof = [
  "Restaurantes modernos",
  "Cafés y brunch",
  "Fast food",
  "Bares y terrazas",
  "Dark kitchens",
  "Food trucks",
];

const showcase = [
  {
    title: "Mesas QR",
    image: "/mnt/data/ChatGPT Image 26 may 2026, 08_25_05.png",
    desc: "Clientes viendo la carta digital desde su teléfono, haciendo pedidos y llamando al camarero directamente desde la mesa.",
  },
  {
    title: "Camareros conectados",
    image: "/mnt/data/ChatGPT Image 26 may 2026, 08_29_05.png",
    desc: "El camarero toma pedidos desde una tablet y todo se envía automáticamente a cocina y caja en segundos.",
  },
  {
    title: "Cocina organizada",
    image: "/mnt/data/ChatGPT Image 26 may 2026, 08_25_20.png",
    desc: "Los cocineros reciben pedidos en pantalla y notifican cuando cada plato está listo para entregar.",
  },
  {
    title: "Autoservicio inteligente",
    image: "/mnt/data/ChatGPT Image 26 may 2026, 08_50_45.png",
    desc: "Clientes hacen pedidos rápidos desde una pantalla en barra o autoservicio sin hacer filas ni esperar atención.",
  },
];

const modules = [
  { name: "HOLU Mesas",          eyebrow: "Cliente en mesa",     desc: "Carta digital, pedidos, llamado al camarero, solicitud de cobro, propina, reseñas y seguimiento del pedido desde un QR." },
  { name: "HOLU Camareros",      eyebrow: "Equipo de servicio",  desc: "Llamados de mesa, pedidos activos, mensajes del cliente, mesas asignadas y colaboración del administrador en tiempo real." },
  { name: "HOLU Cocina",         eyebrow: "Pantalla de cocina",  desc: "Pedidos organizados por estado para acelerar el servicio, reducir errores y mantener al equipo coordinado." },
  { name: "HOLU Administración", eyebrow: "Control total",       desc: "Ventas, empleados, carta, QR de mesas, inventario, propinas, caja, turnos, boletas, reportes y auditoría." },
  { name: "HOLU Inteligencia",   eyebrow: "IA práctica",         desc: "Asistencia inteligente para recomendaciones, alergias, automatizaciones, mensajes, operación y análisis del restaurante." },
  { name: "HOLU Analítica",      eyebrow: "Decisiones claras",   desc: "Métricas de ventas, platos más vendidos, propinas, rendimiento por camarero, tiempos de cocina y comportamiento por mesa." },
];

const metrics = [
  ["-40%", "menos tiempo perdido entre cocina y salón"],
  ["+22%", "más pedidos usando carta QR visual"],
  ["24/7",  "restaurante conectado desde cualquier lugar"],
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
    desc: "Toda la potencia de HOLU con autoservicio, inteligencia artificial y operación avanzada.",
    features: ["Todo el plan Impulso","Tótem de autoservicio","IA en mesa","IA para administración","Recomendaciones inteligentes","Automatizaciones","Multi-sucursal","Analítica avanzada"],
  },
];

const stats = [
  ["Demo real", "Prueba HOLU sin crear cuenta"],
  ["4 roles",   "Mesas, camareros, cocina y caja"],
  ["1 QR",      "Toda la experiencia desde la mesa"],
  ["En vivo",   "Todo sincronizado en tiempo real"],
  ["+ IA",      "Asistencia inteligente integrada"],
  ["Cloud",     "Accede desde cualquier dispositivo"],
];

const faqs = [
  { q: "¿HOLU reemplaza al camarero?",              a: "No. HOLU ayuda al equipo a trabajar mejor. El camarero sigue siendo clave para la atención, la experiencia humana y el cobro presencial cuando corresponde." },
  { q: "¿Funciona con QR por mesa?",                a: "Sí. Cada mesa tiene un QR único. El cliente entra directamente a la experiencia de su mesa y todo queda conectado con pedidos, cocina, camareros y administración." },
  { q: "¿Puedo agregar o editar platos?",           a: "Sí. Desde administración puedes crear platos, cambiar precios, subir imágenes, activar o desactivar disponibilidad y decidir qué ve el cliente." },
  { q: "¿El sistema incluye propinas y caja?",      a: "Sí. HOLU permite registrar propinas aceptadas o rechazadas, abrir caja, cerrar caja, cambiar turnos, imprimir cierres y revisar reportes." },
  { q: "¿Sirve para comida rápida o cafés?",        a: "Sí. Con el módulo de autoservicio puedes usar tótems conectados a la misma carta, cocina, caja y administración." },
  { q: "¿La inteligencia artificial está incluida?", a: "La inteligencia avanzada está incluida en el plan Élite. Puede ayudar con recomendaciones, automatizaciones, respuestas y análisis del restaurante." },
];

const flow = [
  ["1", "Entrar a demo instantánea",          "El restaurante demo ya viene configurado para probar HOLU sin registro."],
  ["2", "Cliente escanea QR",                 "El cliente entra automáticamente a la experiencia de su mesa."],
  ["3", "Cliente pide o llama al camarero",   "Los pedidos, llamados y solicitudes llegan al instante."],
  ["4", "Cocina y equipo reciben en vivo",    "La cocina recibe pedidos organizados automáticamente y actualiza el estado del plato en segundos."],
  ["5", "Administración controla todo",       "Ventas, propinas, caja, cocina y operación conectados desde cualquier dispositivo."],
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600;700;800;900&display=swap');
:root{--bg:#060605;--line:rgba(255,255,255,.1);--text:#fff8ed;--muted:#c0b3a2;--dim:#7a7065;--gold:#c8a96b;--gold2:#f0d48d;--green:#34d399;--shadow:0 28px 90px rgba(0,0,0,.48)}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% -8%,rgba(200,169,107,.25),transparent 32%),radial-gradient(circle at 100% 18%,rgba(255,255,255,.08),transparent 28%),#050504;color:var(--text);font-family:Inter,system-ui,sans-serif}a{color:inherit;text-decoration:none}.page{overflow:hidden}.container{width:min(1180px,calc(100% - 32px));margin:auto}.nav{position:sticky;top:0;z-index:40;background:rgba(6,6,5,.72);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}.nav-in{height:76px;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{font-size:31px;letter-spacing:-.05em;color:#fff;font-weight:900;line-height:.9}.brand small{display:block;font-size:9px;letter-spacing:.26em;color:var(--muted);margin-top:7px}.nav-links{display:flex;align-items:center;gap:20px;color:var(--muted);font-weight:800;font-size:13px}.btn{border:0;border-radius:16px;padding:13px 17px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:9px}.btn.primary{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#151007;box-shadow:0 18px 40px rgba(200,169,107,.22)}.btn.ghost{background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--text)}.hero{position:relative;padding:92px 0 60px}.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:38px;align-items:center}.eyebrow{color:var(--gold2);font-weight:900;letter-spacing:.13em;font-size:12px;text-transform:uppercase}.hero h1{font-size:102px;font-weight:700;line-height:.84;letter-spacing:-.09em;margin:16px 0;max-width:820px}.hero p{color:var(--muted);font-size:18px;line-height:1.7;max-width:650px}.cta-row,.trust,.logos{display:flex;gap:12px;flex-wrap:wrap}.cta-row{margin-top:28px}.trust{margin-top:28px;color:var(--dim);font-size:13px;font-weight:800}.trust span{display:flex;gap:8px;align-items:center}.dot{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 0 5px rgba(52,211,153,.12)}.logos{margin-top:26px}.logo-pill{padding:10px 14px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid var(--line);color:#e9dcc8;font-size:12px;font-weight:800}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:26px}.metric{padding:18px;border-radius:22px;background:rgba(255,255,255,.04);border:1px solid var(--line)}.metric b{display:block;font-size:34px;color:var(--gold2)}.metric span{display:block;color:var(--muted);margin-top:6px;line-height:1.4;font-size:13px}.device{position:relative;border-radius:36px;padding:16px;background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.025));border:1px solid var(--line);box-shadow:var(--shadow)}.device-screen{position:relative;min-height:720px;border-radius:28px;background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.55)),url('/mnt/data/ChatGPT Image 26 may 2026, 08_29_05.png') center/cover;overflow:hidden;padding:18px;display:flex;flex-direction:column;justify-content:space-between}.screen-top{display:flex;justify-content:space-between;align-items:center}.pill{border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.28);border-radius:999px;padding:9px 12px;font-size:12px;font-weight:900}.live-badge{position:absolute;top:18px;right:18px;background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.35);color:#8ff0c5;padding:10px 14px;border-radius:999px;font-size:12px;font-weight:900;backdrop-filter:blur(10px);animation:pulse 2s infinite}.floating-order,.floating-kitchen{position:absolute;border-radius:18px;padding:12px 14px;backdrop-filter:blur(14px)}.floating-order{left:18px;top:90px;background:rgba(0,0,0,.62);border:1px solid rgba(255,255,255,.08)}.floating-kitchen{right:18px;bottom:160px;background:rgba(200,169,107,.12);border:1px solid rgba(200,169,107,.22)}.floating-order b,.floating-kitchen b{color:#fff}.floating-kitchen b{color:var(--gold2)}.floating-order span,.floating-kitchen span{display:block;color:var(--muted);font-size:12px;margin-top:4px}.screen-card{border-radius:28px;background:rgba(6,6,6,.28);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(26px);padding:16px;max-width:460px;box-shadow:0 30px 80px rgba(0,0,0,.45)}.screen-title{font-size:54px;font-weight:900;letter-spacing:-.06em;margin:10px 0 8px;line-height:.88}.screen-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}.mini{position:relative;border-radius:18px;background:rgba(255,255,255,.075);border:1px solid rgba(255,255,255,.1);padding:14px;min-height:96px;overflow:hidden}.mini:after{content:'';position:absolute;right:-22px;bottom:-28px;width:74px;height:74px;border-radius:50%;background:rgba(240,212,141,.08)}.mini b{display:flex;align-items:center;gap:8px;font-size:14px}.mini small{display:block;color:var(--muted);margin-top:8px;line-height:1.35}.mini-icon{width:26px;height:26px;border-radius:10px;background:rgba(240,212,141,.13);display:grid;place-items:center;font-size:11px;font-weight:900;color:var(--gold2)}.stats-shell{margin-top:36px}.stats-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.stats{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;overflow-x:auto;padding-bottom:6px;scrollbar-width:none}.stats::-webkit-scrollbar{display:none}.stat{border-radius:22px;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.025));border:1px solid var(--line);padding:18px;min-width:180px;backdrop-filter:blur(14px);position:relative;overflow:hidden}.stat:before{content:'';position:absolute;top:-40px;right:-40px;width:90px;height:90px;background:rgba(240,212,141,.08);border-radius:50%}.stat b{font-size:26px;color:var(--gold2);display:block;line-height:1}.stat span{display:block;color:var(--muted);font-size:12px;margin-top:8px;line-height:1.45}.section{padding:78px 0}.section-head{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:24px}.section h2{font-size:64px;font-weight:900;line-height:.9;letter-spacing:-.06em;margin:0}.section-head p{color:var(--muted);max-width:480px;line-height:1.65}.modules,.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card,.demo-card-pro{border-radius:26px;background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.025));border:1px solid var(--line);box-shadow:0 16px 50px rgba(0,0,0,.22);padding:20px}.card .label,.demo-card-pro .label{font-size:11px;color:var(--gold2);letter-spacing:.14em;text-transform:uppercase;font-weight:900}.card h3{font-size:23px;margin:11px 0 8px}.card p,.demo-card-pro p{color:var(--muted);line-height:1.55;font-size:14px}.showcase-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.showcase-card{position:relative;overflow:hidden;border-radius:34px;min-height:520px;border:1px solid var(--line);box-shadow:var(--shadow);background:#111}.showcase-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(.72);transform:scale(1.02)}.showcase-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.01),rgba(0,0,0,.92));padding:34px;display:flex;flex-direction:column;justify-content:flex-end}.showcase-overlay h3{font-size:48px;font-weight:900;line-height:.92;margin:0 0 10px}.showcase-overlay p{color:#ddd1c0;line-height:1.6;max-width:440px}.split{display:grid;grid-template-columns:.95fr 1.05fr;gap:18px;align-items:start}.benefits{display:grid;gap:10px}.benefit{display:flex;gap:12px;align-items:flex-start;border-radius:18px;background:rgba(255,255,255,.045);border:1px solid var(--line);padding:14px;color:#eadfce;line-height:1.5}.check{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:rgba(52,211,153,.13);color:var(--green);font-weight:900;flex:0 0 auto}.demo-panel{border-radius:34px;background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.025));border:1px solid var(--line);padding:34px;box-shadow:var(--shadow)}.flow-track{display:grid;gap:14px;margin-top:26px}.flow-card{display:grid;grid-template-columns:54px 1fr;gap:18px;align-items:flex-start;padding:0 0 18px;border-bottom:1px solid rgba(255,255,255,.06)}.flow-card:last-child{padding-bottom:0;border-bottom:0}.flow-number{width:54px;height:54px;border-radius:18px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);display:grid;place-items:center;font-size:18px;font-weight:900;color:var(--gold2);position:relative;top:2px}.flow-content b{display:block;font-size:18px;letter-spacing:-.03em;margin-bottom:8px}.flow-content span{display:block;color:var(--muted);font-size:14px;line-height:1.6;max-width:540px}.demo-card-pro{position:relative;border-radius:34px;overflow:hidden;box-shadow:var(--shadow)}.demo-card-pro:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 80% 10%,rgba(52,211,153,.14),transparent 28%);pointer-events:none}.demo-options{display:grid;gap:12px;margin-top:22px}.demo-option{display:flex;align-items:flex-start;gap:16px;border-radius:22px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);padding:18px;color:var(--text);transition:.25s ease}.demo-option:hover{transform:translateY(-2px);border-color:rgba(240,212,141,.24);background:rgba(255,255,255,.06)}.demo-option.primary-demo{background:linear-gradient(135deg,rgba(200,169,107,.18),rgba(255,255,255,.04));border-color:rgba(240,212,141,.24)}.demo-badge{width:42px;height:42px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);display:grid;place-items:center;color:var(--gold2);font-size:13px;font-weight:900;flex:0 0 auto}.demo-option strong{display:block;font-size:17px;letter-spacing:-.03em}.demo-option small{display:block;color:var(--muted);line-height:1.5;margin-top:6px}.demo-safe{margin-top:16px;border-radius:18px;background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.14);padding:14px;color:#c7f9df;font-size:13px;line-height:1.6}.plan{position:relative}.plan.highlight{border-color:rgba(240,212,141,.38);background:linear-gradient(145deg,rgba(200,169,107,.14),rgba(255,255,255,.03))}.tag{position:absolute;top:14px;right:14px;border-radius:999px;background:rgba(52,211,153,.13);color:var(--green);font-size:11px;padding:7px 10px;font-weight:900}.price{font-size:34px;font-weight:900;color:var(--gold2);margin:14px 0}.features{display:grid;gap:10px;margin:18px 0}.features div{color:var(--muted);font-size:14px}.faq-accordion{display:grid;gap:14px}.faq-item{border-radius:22px;border:1px solid var(--line);background:rgba(255,255,255,.04);overflow:hidden}.faq-btn{width:100%;background:none;border:0;color:var(--text);display:flex;justify-content:space-between;align-items:center;padding:22px;font-size:18px;font-weight:800;cursor:pointer;text-align:left}.faq-answer{padding:0 22px 22px;color:var(--muted);line-height:1.7;font-size:15px}.faq-icon{font-size:26px;color:var(--gold2)}.final{padding:86px 0 100px;text-align:center}.final-box{position:relative;overflow:hidden;border-radius:40px;background:radial-gradient(circle at 50% 0,rgba(200,169,107,.24),transparent 42%),linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.025));border:1px solid var(--line);padding:58px 20px;box-shadow:var(--shadow)}.final-box:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at top right,rgba(240,212,141,.12),transparent 30%);pointer-events:none}.footer{border-top:1px solid var(--line);padding:28px 0;color:var(--dim);font-size:13px}.footer-in{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}@keyframes pulse{0%{transform:scale(1);opacity:1}50%{transform:scale(1.03);opacity:.9}100%{transform:scale(1);opacity:1}}@media(max-width:900px){.nav-links a{display:none}.hero{padding:54px 0 34px}.hero-grid,.split{grid-template-columns:1fr}.hero h1{font-size:54px}.hero p{font-size:16px}.device-screen{min-height:560px}.metrics,.modules,.plans,.showcase-grid{grid-template-columns:1fr}.stats,.flow-track{display:flex;gap:12px;overflow-x:auto;padding-bottom:8px}.stat{min-width:220px}.flow-card{min-width:220px}.section{padding:54px 0}.section-head{display:block}.section h2{font-size:42px}.screen-title{font-size:38px}.showcase-card{min-height:360px}.showcase-overlay h3{font-size:34px}.demo-options{grid-template-columns:1fr}.brand{font-size:25px}.nav-in{height:68px}}
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Landing({ n8nBase, adminUrl }: { n8nBase?: string; adminUrl?: string }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="page">
      <style>{CSS}</style>

      <nav className="nav">
        <div className="container nav-in">
          <a href="#top" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mnt/data/file_00000000d32861f8a34f9c0c65f4d691.png" alt="HOLU" style={{ height: 42 }} />
          </a>
          <div className="nav-links">
            <a href="#modulos">Módulos</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#precios">Planes</a>
            <a href="#faq">Preguntas</a>
            <a className="btn primary" href="#demo">Comenzar ahora</a>
          </div>
        </div>
      </nav>

      <header id="top" className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Simple · Rápido · Todo conectado</div>
            <h1>El caos del restaurante termina con HOLU.</h1>
            <p>HOLU es la forma fácil de organizar tu restaurante: mesas, pedidos, camareros, cocina, caja, propinas y clientes conectados en una sola app.</p>
            <div className="cta-row">
              <a className="btn primary" href="#demo">Probar HOLU</a>
              <a className="btn ghost" href="#modulos">Ver cómo funciona</a>
            </div>
            <div className="trust">
              <span><i className="dot" />Funciona en la nube</span>
              <span><i className="dot" />Fácil de usar</span>
              <span><i className="dot" />Hecho para el día a día</span>
            </div>
            <div className="logos">{socialProof.map(item => <div className="logo-pill" key={item}>{item}</div>)}</div>
            <div className="metrics">{metrics.map(([value, label]) => <div className="metric" key={value}><b>{value}</b><span>{label}</span></div>)}</div>
          </div>

          <div className="device">
            <div className="device-screen">
              <div className="live-badge">● Restaurante en vivo</div>
              <div className="floating-order"><b>Nueva orden · Mesa 7</b><span>2 hamburguesas · 1 limonada</span></div>
              <div className="floating-kitchen"><b>Cocina notificó</b><span>Pedido listo para entregar</span></div>
              <div className="screen-top">
                <div className="brand" style={{ fontSize: 23 }}>HOLU<small>MESA DIGITAL</small></div>
                <span className="pill">Mesa 7</span>
              </div>
              <div className="screen-card">
                <div className="eyebrow">Mesa conectada · Salón</div>
                <h3 className="screen-title">Todo conectado desde la mesa.</h3>
                <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>El cliente escanea el QR y entra a una experiencia moderna donde puede pedir, llamar al camarero, pagar y seguir su pedido.</p>
                <div className="screen-actions">
                  <div className="mini"><b><span className="mini-icon">●</span>Carta</b><small>Platos, fotos y precios claros.</small></div>
                  <div className="mini"><b><span className="mini-icon">◌</span>Camarero</b><small>Mesa solicita atención.</small></div>
                  <div className="mini"><b><span className="mini-icon">✓</span>Cocina</b><small>Pedido listo para servir.</small></div>
                  <div className="mini"><b><span className="mini-icon">▣</span>Cuenta</b><small>Total, propina y cobro.</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container stats-shell">
          <div className="stats-head">
            <div className="eyebrow">Experiencia HOLU</div>
            <div style={{ color: "var(--dim)", fontSize: 12, fontWeight: 800 }}>Desliza →</div>
          </div>
          <div className="stats">{stats.map(([value, label]) => <div className="stat" key={value}><b>{value}</b><span>{label}</span></div>)}</div>
        </div>
      </header>

      <section id="modulos" className="section">
        <div className="container">
          <div className="section-head">
            <h2>La experiencia moderna que transforma restaurantes.</h2>
            <p>HOLU une clientes, camareros, cocina, caja y administración en una experiencia visual, rápida y moderna.</p>
          </div>
          <div className="modules">
            {modules.map(m => <article className="card" key={m.name}><span className="label">{m.eyebrow}</span><h3>{m.name}</h3><p>{m.desc}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Diseñado para sentirse moderno desde el primer segundo.</h2>
            <p>HOLU no parece un POS antiguo. Se siente como una app moderna diseñada para restaurantes que quieren una operación rápida, limpia y organizada.</p>
          </div>
          <div className="showcase-grid">
            {showcase.map(item => (
              <article className="showcase-card" key={item.title}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} />
                <div className="showcase-overlay">
                  <div className="eyebrow">Experiencia HOLU</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="section">
        <div className="container split">
          <div>
            <div className="eyebrow">Por qué HOLU</div>
            <h2>Diseñado para restaurantes que quieren crecer sin perder el control.</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>HOLU fue creado para que cualquier persona pueda operar el restaurante desde el primer día sin capacitación técnica.</p>
          </div>
          <div className="benefits">
            {benefits.map(b => <div className="benefit" key={b}><span className="check">✓</span><span>{b}</span></div>)}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div className="demo-panel">
            <div className="eyebrow">Flujo real</div>
            <h2 style={{ fontSize: 48, letterSpacing: "-.06em" }}>De la mesa a la cocina. Sin caos.</h2>
            <div className="flow-track">
              {flow.map(([number, title, text]) => (
                <div className="flow-card" key={number}>
                  <div className="flow-number">{number}</div>
                  <div className="flow-content"><b>{title}</b><span>{text}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="demo-card-pro">
            <span className="label">Demo sin registro</span>
            <h3 style={{ fontSize: 34, lineHeight: 1, letterSpacing: "-.05em", margin: "12px 0" }}>Pruébalo como si fuera tu restaurante.</h3>
            <p>La demo está separada de producción, usa datos temporales y se reinicia automáticamente. Puedes tocar, mover pedidos y explorar sin ensuciar la base real.</p>
            <div className="demo-options">
              <a className="demo-option primary-demo" href="/demo"><div className="demo-badge">DEMO</div><div><strong>Entrar a demo restaurante</strong><small>Vista completa con mesas, cocina, caja y administración.</small></div></a>
              <a className="demo-option" href="/demo/mesa/7"><div className="demo-badge">QR</div><div><strong>Mesa QR</strong><small>Vive la experiencia del cliente.</small></div></a>
              <a className="demo-option" href="/demo/cocina"><div className="demo-badge">KDS</div><div><strong>Cocina</strong><small>Pedidos y estados en vivo.</small></div></a>
              <a className="demo-option" href="/demo/caja"><div className="demo-badge">POS</div><div><strong>Caja</strong><small>Cobro, propina y cierre.</small></div></a>
            </div>
            <div className="demo-safe">Tu información no se guarda hasta crear un restaurante real.</div>
          </div>
        </div>
      </section>

      <section id="precios" className="section">
        <div className="container">
          <div className="section-head">
            <h2>Empieza hoy. Activa tu restaurante cuando quieras.</h2>
            <p>Prueba la demo completa sin registro. Cuando quieras operar tu restaurante real, activas HOLU en minutos desde la nube.</p>
          </div>
          <div className="plans">
            {plans.map(plan => (
              <article className={`card plan ${plan.highlight ? "highlight" : ""}`} key={plan.name}>
                {plan.highlight && <span className="tag">Recomendado</span>}
                <h3>{plan.name}</h3>
                <div className="price">{plan.price}<small style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}> / mes</small></div>
                <p>{plan.desc}</p>
                <div className="features">{plan.features.map(f => <div key={f}>✓ {f}</div>)}</div>
                <a className={plan.highlight ? "btn primary" : "btn ghost"} href="#demo" style={{ width: "100%" }}>Comenzar ahora</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="section">
        <div className="container split">
          <div>
            <div className="eyebrow">Prueba HOLU ahora</div>
            <h2>Entra a una demo real sin registrarte.</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>Prueba mesas QR, cocina, camareros, caja y autoservicio con un restaurante demo completamente funcional. Sin tarjetas, sin instalación y sin crear cuenta.</p>
          </div>
          <div className="demo-card-pro">
            <span className="label">Acceso instantáneo</span>
            <h3 style={{ fontSize: 34, lineHeight: 1, letterSpacing: "-.05em", margin: "12px 0" }}>Elige cómo quieres probar HOLU.</h3>
            <p>La demo está lista para usar desde cualquier dispositivo. No necesitas tarjeta, instalación ni crear usuario.</p>
            <div className="demo-options">
              <a className="demo-option primary-demo" href="/demo"><div className="demo-badge">DEMO</div><div><strong>Demo completa</strong><small>Todo el restaurante funcionando.</small></div></a>
              <a className="demo-option" href="/demo/mesa/7"><div className="demo-badge">QR</div><div><strong>Mesa QR</strong><small>Cliente escaneando y pidiendo.</small></div></a>
              <a className="demo-option" href="/demo/cocina"><div className="demo-badge">KDS</div><div><strong>Cocina</strong><small>Pedidos organizados en vivo.</small></div></a>
              <a className="demo-option" href="/demo/caja"><div className="demo-badge">POS</div><div><strong>Caja</strong><small>Pagos, propinas y boletas.</small></div></a>
            </div>
            <div className="demo-safe">La demo usa datos temporales y se reinicia automáticamente.</div>
          </div>
        </div>
      </section>

      <section id="faq" className="section">
        <div className="container">
          <div className="section-head">
            <h2>Todo lo que normalmente preguntan antes de usar HOLU.</h2>
            <p>Respondemos las preguntas más comunes sobre operación, instalación, QR, cocina y funcionamiento del sistema.</p>
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

      <section className="final">
        <div className="container">
          <div className="final-box">
            <div className="eyebrow">El restaurante moderno empieza aquí</div>
            <h2 style={{ maxWidth: 900, margin: "0 auto", fontSize: "clamp(56px,7vw,110px)", lineHeight: ".82", letterSpacing: "-.08em" }}>El restaurante moderno funciona con HOLU.</h2>
            <p style={{ color: "var(--muted)", maxWidth: 720, margin: "14px auto 28px", lineHeight: 1.8 }}>Clientes pidiendo desde la mesa, camareros conectados, cocina sincronizada, caja organizada y autoservicio funcionando en tiempo real.</p>
            <a className="btn primary" href="/demo">Probar demo gratis</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-in">
          <span>© {new Date().getFullYear()} HOLU. El restaurante fácil.</span>
          <span>Mesas · Camareros · Cocina · Administración · IA · Analítica</span>
        </div>
      </footer>
    </div>
  );
}
