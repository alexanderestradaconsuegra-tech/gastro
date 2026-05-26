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
    gradient: "linear-gradient(145deg,#1a1208,#3d2a0a)",
    accent: "rgba(200,169,107,.18)",
    icon: "⬡",
    desc: "Clientes viendo la carta digital desde su teléfono, haciendo pedidos y llamando al camarero directamente desde la mesa.",
  },
  {
    title: "Camareros conectados",
    gradient: "linear-gradient(145deg,#0a1220,#0d2340)",
    accent: "rgba(100,160,240,.15)",
    icon: "◎",
    desc: "El camarero toma pedidos desde una tablet y todo se envía automáticamente a cocina y caja en segundos.",
  },
  {
    title: "Cocina organizada",
    gradient: "linear-gradient(145deg,#081a12,#0d3020)",
    accent: "rgba(52,211,153,.15)",
    icon: "▣",
    desc: "Los cocineros reciben pedidos en pantalla y notifican cuando cada plato está listo para entregar.",
  },
  {
    title: "Autoservicio inteligente",
    gradient: "linear-gradient(145deg,#14081a,#280d38)",
    accent: "rgba(168,100,240,.15)",
    icon: "◈",
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
:root{--bg:#060605;--line:rgba(255,255,255,.1);--text:#fff8ed;--muted:#b0a396;--dim:#6a6058;--gold:#c8a96b;--gold2:#f0d48d;--green:#34d399;--shadow:0 28px 90px rgba(0,0,0,.48)}
*{box-sizing:border-box}
body{margin:0;background:radial-gradient(circle at 12% -8%,rgba(200,169,107,.18),transparent 32%),radial-gradient(circle at 100% 18%,rgba(255,255,255,.05),transparent 28%),#050504;color:var(--text);font-family:Inter,system-ui,sans-serif;font-size:16px;line-height:1.5}
a{color:inherit;text-decoration:none}
.page{overflow:hidden}
.container{width:min(1160px,calc(100% - 40px));margin:auto}

/* NAV */
.nav{position:sticky;top:0;z-index:40;background:rgba(6,6,5,.8);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}
.nav-in{height:72px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{font-size:28px;letter-spacing:-.06em;color:#fff;font-weight:800;line-height:1}
.brand small{display:block;font-size:9px;letter-spacing:.22em;color:var(--muted);margin-top:4px;font-weight:500}
.nav-links{display:flex;align-items:center;gap:22px;color:var(--muted);font-weight:500;font-size:14px}
.nav-links a:not(.btn):hover{color:var(--text)}

/* BUTTONS */
.btn{border:0;border-radius:14px;padding:12px 20px;font-weight:600;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:.2s ease}
.btn.primary{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#160f02;box-shadow:0 12px 32px rgba(200,169,107,.2)}
.btn.primary:hover{box-shadow:0 16px 40px rgba(200,169,107,.32);transform:translateY(-1px)}
.btn.ghost{background:rgba(255,255,255,.07);border:1px solid var(--line);color:var(--text)}
.btn.ghost:hover{background:rgba(255,255,255,.11)}

/* HERO */
.hero{position:relative;padding:88px 0 56px}
.hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center}
.eyebrow{color:var(--gold2);font-weight:600;letter-spacing:.12em;font-size:11px;text-transform:uppercase}
.hero h1{font-size:clamp(52px,7vw,88px);font-weight:700;line-height:.88;letter-spacing:-.06em;margin:14px 0 18px;max-width:800px;color:#fff}
.hero p{color:var(--muted);font-size:17px;line-height:1.75;max-width:560px}
.cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}
.trust{display:flex;gap:18px;flex-wrap:wrap;margin-top:22px;color:var(--dim);font-size:13px;font-weight:500}
.trust span{display:flex;gap:7px;align-items:center}
.dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px rgba(52,211,153,.12);flex:0 0 auto}
.logos{display:flex;gap:8px;flex-wrap:wrap;margin-top:22px}
.logo-pill{padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid var(--line);color:#c8bba8;font-size:12px;font-weight:500}
.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}
.metric{padding:16px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid var(--line)}
.metric b{display:block;font-size:30px;font-weight:700;color:var(--gold2);line-height:1}
.metric span{display:block;color:var(--muted);margin-top:6px;line-height:1.4;font-size:13px}

/* DEVICE MOCK */
.device{position:relative;border-radius:32px;padding:14px;background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.02));border:1px solid var(--line);box-shadow:var(--shadow)}
.device-screen{position:relative;min-height:680px;border-radius:24px;background:linear-gradient(160deg,#0f0d08,#1c1508,#0a0f1a);overflow:hidden;padding:18px;display:flex;flex-direction:column;justify-content:space-between}
.device-screen::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 70% 20%,rgba(200,169,107,.12),transparent 45%),radial-gradient(circle at 20% 80%,rgba(52,211,153,.06),transparent 40%);pointer-events:none}
.screen-top{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1}
.pill{border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.4);border-radius:999px;padding:8px 14px;font-size:12px;font-weight:600;backdrop-filter:blur(8px)}
.live-badge{position:absolute;top:18px;right:18px;background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.28);color:#8ff0c5;padding:8px 14px;border-radius:999px;font-size:12px;font-weight:600;backdrop-filter:blur(10px);animation:pulse 2.4s infinite;z-index:1}
.floating-order,.floating-kitchen{position:absolute;border-radius:16px;padding:12px 14px;backdrop-filter:blur(14px);z-index:2}
.floating-order{left:18px;top:86px;background:rgba(0,0,0,.65);border:1px solid rgba(255,255,255,.1)}
.floating-kitchen{right:18px;bottom:180px;background:rgba(200,169,107,.1);border:1px solid rgba(200,169,107,.2)}
.floating-order b,.floating-kitchen b{font-size:13px;font-weight:600}
.floating-kitchen b{color:var(--gold2)}
.floating-order span,.floating-kitchen span{display:block;color:var(--muted);font-size:12px;margin-top:3px}
.screen-card{border-radius:24px;background:rgba(6,6,6,.55);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(24px);padding:18px;position:relative;z-index:1}
.screen-title{font-size:clamp(32px,4vw,50px);font-weight:700;letter-spacing:-.05em;margin:10px 0 8px;line-height:.92}
.screen-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}
.mini{position:relative;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);padding:12px;overflow:hidden}
.mini b{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600}
.mini small{display:block;color:var(--muted);margin-top:6px;line-height:1.35;font-size:12px}
.mini-icon{width:22px;height:22px;border-radius:8px;background:rgba(240,212,141,.12);display:grid;place-items:center;font-size:10px;font-weight:700;color:var(--gold2)}

/* STATS STRIP */
.stats-shell{margin-top:32px}
.stats-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.stats{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
.stats::-webkit-scrollbar{display:none}
.stat{border-radius:18px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.02));border:1px solid var(--line);padding:16px;min-width:170px;backdrop-filter:blur(10px)}
.stat b{font-size:22px;color:var(--gold2);display:block;font-weight:700;line-height:1}
.stat span{display:block;color:var(--muted);font-size:12px;margin-top:6px;line-height:1.4}

/* SECTIONS */
.section{padding:72px 0}
.section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:28px}
.section h2{font-size:clamp(36px,5vw,60px);font-weight:700;line-height:.92;letter-spacing:-.05em;margin:0}
.section-head p{color:var(--muted);max-width:440px;line-height:1.7;font-size:15px}

/* MODULE CARDS */
.modules{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.card{border-radius:22px;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid var(--line);padding:22px;transition:.2s ease}
.card:hover{transform:translateY(-2px);border-color:rgba(240,212,141,.18)}
.card .label{font-size:10px;color:var(--gold2);letter-spacing:.14em;text-transform:uppercase;font-weight:600}
.card h3{font-size:20px;margin:10px 0 8px;font-weight:600;letter-spacing:-.03em}
.card p{color:var(--muted);line-height:1.6;font-size:14px;margin:0}

/* SHOWCASE */
.showcase-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.showcase-card{position:relative;overflow:hidden;border-radius:28px;min-height:460px;border:1px solid var(--line);box-shadow:var(--shadow)}
.showcase-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.showcase-icon{font-size:160px;opacity:.07;line-height:1;user-select:none}
.showcase-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 20%,rgba(0,0,0,.88));padding:28px;display:flex;flex-direction:column;justify-content:flex-end}
.showcase-overlay h3{font-size:clamp(28px,3.5vw,42px);font-weight:700;line-height:.95;margin:0 0 10px;letter-spacing:-.04em}
.showcase-overlay p{color:#cdc2b0;line-height:1.65;max-width:400px;font-size:14px;margin:0}

/* SPLIT */
.split{display:grid;grid-template-columns:.95fr 1.05fr;gap:16px;align-items:start}

/* BENEFITS */
.benefits{display:grid;gap:8px}
.benefit{display:flex;gap:12px;align-items:flex-start;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid var(--line);padding:14px;color:#e2d8cb;line-height:1.55;font-size:15px}
.check{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:rgba(52,211,153,.12);color:var(--green);font-weight:700;flex:0 0 auto;font-size:13px}

/* DEMO PANEL */
.demo-panel{border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid var(--line);padding:28px;box-shadow:var(--shadow)}
.flow-track{display:grid;gap:12px;margin-top:22px}
.flow-card{display:grid;grid-template-columns:50px 1fr;gap:16px;align-items:flex-start;padding:0 0 16px;border-bottom:1px solid rgba(255,255,255,.06)}
.flow-card:last-child{padding-bottom:0;border-bottom:0}
.flow-number{width:50px;height:50px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);display:grid;place-items:center;font-size:17px;font-weight:700;color:var(--gold2);position:relative;top:2px}
.flow-content b{display:block;font-size:16px;font-weight:600;letter-spacing:-.02em;margin-bottom:5px}
.flow-content span{display:block;color:var(--muted);font-size:14px;line-height:1.6}
.demo-card-pro{position:relative;border-radius:28px;overflow:hidden;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border:1px solid var(--line);padding:28px;box-shadow:var(--shadow)}
.demo-card-pro::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 80% 10%,rgba(52,211,153,.1),transparent 30%);pointer-events:none}
.demo-options{display:grid;gap:10px;margin-top:20px;position:relative;z-index:1}
.demo-option{display:flex;align-items:flex-start;gap:14px;border-radius:18px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);padding:16px;color:var(--text);transition:.2s ease}
.demo-option:hover{transform:translateY(-2px);border-color:rgba(240,212,141,.22);background:rgba(255,255,255,.07)}
.demo-option.primary-demo{background:linear-gradient(135deg,rgba(200,169,107,.14),rgba(255,255,255,.04));border-color:rgba(240,212,141,.24)}
.demo-badge{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);display:grid;place-items:center;color:var(--gold2);font-size:11px;font-weight:700;flex:0 0 auto}
.demo-option strong{display:block;font-size:15px;font-weight:600;letter-spacing:-.02em}
.demo-option small{display:block;color:var(--muted);line-height:1.5;margin-top:4px;font-size:13px}
.demo-safe{margin-top:14px;border-radius:14px;background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.12);padding:12px 14px;color:#b8f5d8;font-size:13px;line-height:1.6;position:relative;z-index:1}

/* PLANS */
.plans{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.plan{position:relative}
.plan.highlight{border-color:rgba(240,212,141,.32);background:linear-gradient(145deg,rgba(200,169,107,.1),rgba(255,255,255,.03))}
.tag{position:absolute;top:14px;right:14px;border-radius:999px;background:rgba(52,211,153,.12);color:var(--green);font-size:11px;padding:6px 10px;font-weight:600;letter-spacing:.04em}
.price{font-size:32px;font-weight:700;color:var(--gold2);margin:12px 0}
.features{display:grid;gap:8px;margin:16px 0}
.features div{color:var(--muted);font-size:14px;line-height:1.4}

/* FAQ */
.faq-accordion{display:grid;gap:10px}
.faq-item{border-radius:18px;border:1px solid var(--line);background:rgba(255,255,255,.03);overflow:hidden}
.faq-btn{width:100%;background:none;border:0;color:var(--text);display:flex;justify-content:space-between;align-items:center;padding:20px 22px;font-size:16px;font-weight:600;cursor:pointer;text-align:left;gap:16px}
.faq-btn:hover{background:rgba(255,255,255,.03)}
.faq-answer{padding:0 22px 20px;color:var(--muted);line-height:1.75;font-size:14px}
.faq-icon{font-size:22px;color:var(--gold2);flex:0 0 auto;line-height:1}

/* FINAL CTA */
.final{padding:80px 0 96px;text-align:center}
.final-box{position:relative;overflow:hidden;border-radius:36px;background:radial-gradient(circle at 50% 0,rgba(200,169,107,.2),transparent 44%),linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.02));border:1px solid var(--line);padding:64px 24px;box-shadow:var(--shadow)}
.final-box::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at top right,rgba(240,212,141,.1),transparent 32%);pointer-events:none}
.final-box h2{font-size:clamp(44px,6.5vw,96px);font-weight:700;line-height:.86;letter-spacing:-.07em;margin:12px auto 16px;position:relative;z-index:1}
.final-box p{color:var(--muted);max-width:640px;margin:0 auto 28px;line-height:1.8;position:relative;z-index:1}

/* FOOTER */
.footer{border-top:1px solid var(--line);padding:26px 0;color:var(--dim);font-size:13px}
.footer-in{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}

@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.85;transform:scale(1.025)}}

@media(max-width:920px){
  .nav-links a:not(.btn){display:none}
  .hero{padding:52px 0 32px}
  .hero-grid,.split{grid-template-columns:1fr}
  .hero h1{font-size:clamp(40px,9vw,64px)}
  .hero p{font-size:15px}
  .device{display:none}
  .metrics,.modules,.plans,.showcase-grid{grid-template-columns:1fr}
  .stats{display:flex;overflow-x:auto;padding-bottom:8px}
  .stat{min-width:160px}
  .section{padding:52px 0}
  .section-head{display:block}
  .showcase-card{min-height:320px}
  .brand{font-size:24px}
  .nav-in{height:64px}
}
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
            HOLU<small>SISTEMA DE RESTAURANTE</small>
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
                <div className="brand" style={{ fontSize: 20 }}>HOLU<small>MESA DIGITAL</small></div>
                <span className="pill">Mesa 7</span>
              </div>
              <div className="screen-card">
                <div className="eyebrow">Mesa conectada · Salón</div>
                <h3 className="screen-title">Todo conectado desde la mesa.</h3>
                <p style={{ color: "var(--muted)", lineHeight: 1.65, fontSize: 14, margin: "8px 0 0" }}>El cliente escanea el QR y entra a una experiencia moderna donde puede pedir, llamar al camarero, pagar y seguir su pedido.</p>
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
            <div style={{ color: "var(--dim)", fontSize: 12, fontWeight: 500 }}>Desliza →</div>
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
              <article className="showcase-card" key={item.title} style={{ background: item.gradient }}>
                <div className="showcase-bg" style={{ background: item.accent }}>
                  <span className="showcase-icon">{item.icon}</span>
                </div>
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
            <p style={{ color: "var(--muted)", lineHeight: 1.75, fontSize: 15 }}>HOLU fue creado para que cualquier persona pueda operar el restaurante desde el primer día sin capacitación técnica.</p>
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
            <h2 style={{ fontSize: "clamp(34px,4vw,48px)", letterSpacing: "-.05em", marginTop: 12 }}>De la mesa a la cocina. Sin caos.</h2>
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
            <h3 style={{ fontSize: "clamp(24px,3vw,32px)", lineHeight: 1.05, letterSpacing: "-.04em", margin: "12px 0 10px", fontWeight: 700 }}>Pruébalo como si fuera tu restaurante.</h3>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>La demo está separada de producción, usa datos temporales y se reinicia automáticamente. Puedes tocar, mover pedidos y explorar sin ensuciar la base real.</p>
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
                <div className="price">{plan.price}<small style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}> / mes</small></div>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>{plan.desc}</p>
                <div className="features">{plan.features.map(f => <div key={f}>✓ {f}</div>)}</div>
                <a className={plan.highlight ? "btn primary" : "btn ghost"} href="#demo" style={{ width: "100%", marginTop: 4 }}>Comenzar ahora</a>
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
            <p style={{ color: "var(--muted)", lineHeight: 1.75, fontSize: 15 }}>Prueba mesas QR, cocina, camareros, caja y autoservicio con un restaurante demo completamente funcional. Sin tarjetas, sin instalación y sin crear cuenta.</p>
          </div>
          <div className="demo-card-pro">
            <span className="label">Acceso instantáneo</span>
            <h3 style={{ fontSize: "clamp(24px,3vw,32px)", lineHeight: 1.05, letterSpacing: "-.04em", margin: "12px 0 10px", fontWeight: 700 }}>Elige cómo quieres probar HOLU.</h3>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>La demo está lista para usar desde cualquier dispositivo. No necesitas tarjeta, instalación ni crear usuario.</p>
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
            <h2>El restaurante moderno funciona con HOLU.</h2>
            <p>Clientes pidiendo desde la mesa, camareros conectados, cocina sincronizada, caja organizada y autoservicio funcionando en tiempo real.</p>
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
