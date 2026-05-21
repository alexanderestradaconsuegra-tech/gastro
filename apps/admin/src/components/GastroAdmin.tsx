"use client";

import { useMemo, useState } from "react";
import { useBackofficeState } from "@/hooks/useBackofficeState";
import { uploadMenuImage, uploadStaffAvatar } from "@/lib/storage";
import type { StaffProfile } from "@/hooks/useAuth";
import {
  WEBHOOKS,
  type StaffRole,
  type TabId,
  type StaffMember,
  type MenuItem,
  type OrderStatus,
} from "@/lib/constants";

// ═══════════════════════════════════════════════════════════════════════════════
// GASTRO ADMIN BACKOFFICE — ADMIN + CAMARERO
// Sistema interno separado del cliente QR.
// ═══════════════════════════════════════════════════════════════════════════════

export interface GastroAdminProps {
  authStaff?: StaffProfile;
  onSignOut?: () => void;
}

const money = (n: number | string | undefined) =>
  `$${Number(n || 0).toLocaleString("es-CL")}`;

const RESTAURANT = {
  name: "NIDO",
  legalName: "NIDO SpA",
  rut: "76.543.210-9",
  address: "Av. Italia 1450, Providencia, Santiago",
  phone: "+56 2 2345 6789",
  website: "nido.cl",
  location: "Santiago · Salón Principal",
  service: "Cena",
};

const RECEIPT_CONFIG = {
  title: "BOLETA ELECTRÓNICA",
  footer: "Gracias por visitar NIDO · Vuelve pronto",
  taxLabel: "IVA incluido",
  showWaiter: true,
  showQr: true,
  printer: "Epson TM-T20III · 80mm",
  printerIp: "192.168.1.44",
  paperWidth: "80mm",
  printMode: "Ticket térmico nítido",
};

const STAFF_PHOTOS: Record<string, string> = {
  "marco@nido.cl":
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
  "isabella@nido.cl":
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
  "tomas@nido.cl":
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop",
  "admin@nido.cl":
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
  "cocina@nido.cl":
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop",
  "caja@nido.cl":
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop",
};

const STATUS_DISPLAY: Record<string, string> = {
  received: "Recibido",
  prep: "Preparando",
  plating: "Listo para servir",
  served: "Servido",
  cancelled: "Cancelado",
};

const KITCHEN_COLUMNS: Record<string, string> = {
  received: "Recibido",
  preparing: "Preparando",
  ready: "Listo para servir",
  delivered: "Servido",
};

const SALES_PERIODS: Record<string, { label: string; sales: number; tips: number; tickets: number; avgTicket: number }> = {
  day: { label: "Día", sales: 497400, tips: 29150, tickets: 18, avgTicket: 27633 },
  month: { label: "Mes", sales: 14892400, tips: 1287400, tickets: 522, avgTicket: 28529 },
  year: { label: "Año", sales: 174881000, tips: 14932000, tickets: 6240, avgTicket: 28025 },
};

const MENU_SALES = [
  { id: "tagliatelle", dish: "Tagliatelle al Ragù", category: "Principales", sold: 34, revenue: 731000, avgPrep: 18, stock: "OK" },
  { id: "spritz", dish: "Spritz Aperol", category: "Bebidas", sold: 61, revenue: 597800, avgPrep: 5, stock: "OK" },
  { id: "ossobuco", dish: "Osso Buco Milanese", category: "Principales", sold: 18, revenue: 585000, avgPrep: 32, stock: "Bajo" },
  { id: "branzino", dish: "Branzino al Forno", category: "Principales", sold: 13, revenue: 375700, avgPrep: 25, stock: "OK" },
  { id: "burrata", dish: "Burrata di Bufala", category: "Entradas", sold: 22, revenue: 319000, avgPrep: 8, stock: "OK" },
  { id: "tiramisu", dish: "Tiramisù Classico", category: "Postres", sold: 25, revenue: 237500, avgPrep: 7, stock: "OK" },
];

const RECEIPT_ITEMS = [
  { name: "Tagliatelle al Ragù", qty: 1, price: 21500 },
  { name: "Spritz Aperol", qty: 2, price: 9800 },
  { name: "Tiramisù Classico", qty: 1, price: 9500 },
];

const PERMISSIONS = [
  { module: "Mesas", admin: true, camarero: true, cocina: false, caja: true },
  { module: "Pedidos", admin: true, camarero: true, cocina: true, caja: false },
  { module: "Ventas", admin: true, camarero: false, cocina: false, caja: true },
  { module: "Carta", admin: true, camarero: false, cocina: false, caja: false },
  { module: "Inventario", admin: true, camarero: false, cocina: true, caja: false },
  { module: "Caja", admin: true, camarero: false, cocina: false, caja: true },
  { module: "Usuarios", admin: true, camarero: false, cocina: false, caja: false },
];

const icons = {
  dashboard: <svg viewBox="0 0 24 24"><path d="M4 13h7V4H4Zm9 7h7V4h-7ZM4 20h7v-5H4Z" /></svg>,
  table: <svg viewBox="0 0 24 24"><path d="M4 10h16M6 10v10M18 10v10M8 4h8l2 6H6Z" /></svg>,
  order: <svg viewBox="0 0 24 24"><path d="M7 4h10l1 18-6-3-6 3Z" /></svg>,
  bell: <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M10 21h4" /></svg>,
  kitchen: <svg viewBox="0 0 24 24"><path d="M6 14h12v7H6zM7 14c-2-1-3-3-2-5 1-2 3-2 4-1 1-3 6-3 7 0 2-1 4 0 5 2 1 3-2 5-4 4" /></svg>,
  chat: <svg viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /></svg>,
  sales: <svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h18M8 16V9M13 16V4M18 16v-6" /></svg>,
  users: <svg viewBox="0 0 24 24"><path d="M16 21a6 6 0 0 0-12 0M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21a6 6 0 0 0-5-5.9M17 3.3a4 4 0 0 1 0 7.4" /></svg>,
  menu: <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>,
  star: <svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21 7 14.2 2 9.3l6.9-1Z" /></svg>,
  settings: <svg viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" /><path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-2 3.5-.2-.1a1.8 1.8 0 0 0-2.1.2 1.8 1.8 0 0 0-.6 1.9H9a1.8 1.8 0 0 0-.6-1.9 1.8 1.8 0 0 0-2.1-.2l-.2.1-2-3.5.1-.1a1.8 1.8 0 0 0 .4-2A1.8 1.8 0 0 0 3 13.5v-4A1.8 1.8 0 0 0 4.6 8a1.8 1.8 0 0 0-.4-2l-.1-.1 2-3.5.2.1a1.8 1.8 0 0 0 2.1-.2A1.8 1.8 0 0 0 9 .4h6a1.8 1.8 0 0 0 .6 1.9 1.8 1.8 0 0 0 2.1.2l.2-.1 2 3.5-.1.1a1.8 1.8 0 0 0-.4 2A1.8 1.8 0 0 0 21 9.5v4a1.8 1.8 0 0 0-1.6 1.5Z" /></svg>,
  signout: <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>,
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700;800;900&display=swap');
:root{--bg:#070604;--panel:#14110e;--panel2:#1f1a15;--card:#18130f;--line:rgba(255,255,255,.09);--text:#fff7ed;--muted:#bcae9f;--dim:#7d7064;--gold:#d9a441;--gold2:#f7d37b;--red:#ef4444;--red2:#fca5a5;--green:#34d399;--blue:#60a5fa;--purple:#a78bfa;--shadow:0 24px 80px rgba(0,0,0,.45)}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 10% 0,rgba(217,164,65,.22),transparent 28%),radial-gradient(circle at 110% 20%,rgba(96,165,250,.12),transparent 34%),#050403;color:var(--text);font-family:Inter,system-ui,sans-serif}.app{min-height:100dvh;display:grid;grid-template-columns:286px 1fr;background:linear-gradient(180deg,rgba(255,255,255,.02),transparent)}svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.sidebar{position:sticky;top:0;height:100dvh;padding:18px;border-right:1px solid var(--line);background:rgba(10,8,6,.86);backdrop-filter:blur(22px);display:flex;flex-direction:column}.brand{font-family:'Playfair Display',serif;letter-spacing:.14em;color:var(--gold2);font-size:31px;line-height:.9}.brand small{display:block;font-family:Inter;font-size:10px;letter-spacing:.2em;color:var(--muted);margin-top:8px}.role-card{margin:18px 0;padding:14px;border-radius:20px;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));border:1px solid var(--line)}.role-switch{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.role-switch button,.nav button,.chip,.btn{border:0;cursor:pointer}.role-switch button{border-radius:14px;padding:11px 8px;background:rgba(255,255,255,.06);color:var(--muted);font-weight:900}.role-switch .on,.tab .on{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#171006}.nav{display:grid;gap:7px;margin-top:8px}.nav button{display:flex;align-items:center;gap:11px;text-align:left;border-radius:16px;padding:13px 12px;background:transparent;color:var(--muted);font-weight:800}.nav button.on{background:rgba(247,211,123,.12);color:var(--gold2)}.nav button.locked{opacity:.35;cursor:not-allowed}.side-footer{margin-top:auto;color:var(--dim);font-size:12px;line-height:1.5}.main{padding:22px;min-width:0}.topbar{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:18px}.title h1{font-family:'Playfair Display',serif;font-size:42px;line-height:.96;margin:0;letter-spacing:-.05em}.title p{margin:8px 0 0;color:var(--muted)}.operator{display:flex;gap:10px;align-items:center;padding:11px 13px;border-radius:18px;border:1px solid var(--line);background:rgba(255,255,255,.045)}.avatar{width:42px;height:42px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#171006;font-weight:900;object-fit:cover}.avatar.img{background:#111;border:1px solid var(--line)}.staff-photo{width:76px;height:76px;border-radius:22px;object-fit:cover;border:1px solid var(--line);box-shadow:0 12px 28px rgba(0,0,0,.28)}.select{background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--text);border-radius:14px;padding:10px;outline:none}.input,.textarea{width:100%;background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--text);border-radius:14px;padding:12px;outline:none;font:inherit}.textarea{min-height:82px;resize:vertical}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field label{display:block;color:var(--muted);font-size:12px;font-weight:800;margin-bottom:6px}.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.62);display:grid;place-items:center;z-index:80;padding:18px}.modal{width:min(760px,100%);max-height:90dvh;overflow:auto;border-radius:26px;background:#100d0a;border:1px solid var(--line);box-shadow:var(--shadow);padding:18px}.preview-phone{border-radius:24px;border:1px solid var(--line);background:rgba(255,255,255,.035);padding:14px}.client-dish{border-radius:18px;background:rgba(255,255,255,.055);border:1px solid var(--line);padding:12px;margin-bottom:8px}.dish-thumb{width:74px;height:74px;border-radius:16px;object-fit:cover;background:rgba(255,255,255,.08);border:1px solid var(--line);flex-shrink:0}.dish-thumb.big{width:100%;height:180px;border-radius:20px;margin-bottom:12px}.image-upload{border:1px dashed rgba(247,211,123,.35);border-radius:18px;padding:14px;background:rgba(247,211,123,.05);display:grid;gap:10px}.image-actions{display:flex;gap:8px;flex-wrap:wrap}.client-dish h4{margin:0 0 4px}.client-dish p{margin:0;color:var(--muted);font-size:12px}.toggle{display:inline-flex;align-items:center;gap:8px;color:var(--muted);font-weight:800}.toggle input{accent-color:#d9a441}.grid{display:grid;gap:14px}.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.kpi,.panel,.table-card,.message-card{border-radius:22px;background:linear-gradient(145deg,rgba(255,255,255,.07),rgba(255,255,255,.025));border:1px solid var(--line);box-shadow:var(--shadow)}.kpi{padding:16px;min-height:112px}.kpi span{color:var(--muted);font-size:12px;font-weight:700}.kpi strong{display:block;font-size:30px;margin:8px 0 4px}.kpi small{color:var(--dim)}.two{display:grid;grid-template-columns:1.1fr .9fr;gap:14px}.three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.panel{padding:16px;min-width:0}.panel-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px}.panel h2{font-family:'Playfair Display',serif;font-size:27px;margin:0;letter-spacing:-.04em}.panel p{color:var(--muted)}.list{display:grid;gap:10px}.row{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:13px;border-radius:17px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.065)}.row-main b{display:block}.row-main small{display:block;color:var(--muted);margin-top:4px;line-height:1.35}.badge{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:900;background:rgba(247,211,123,.12);color:var(--gold2);white-space:nowrap}.badge.red{background:rgba(239,68,68,.12);color:var(--red2)}.badge.green{background:rgba(52,211,153,.12);color:var(--green)}.badge.blue{background:rgba(96,165,250,.12);color:#93c5fd}.badge.purple{background:rgba(167,139,250,.12);color:#c4b5fd}.btn{border-radius:14px;padding:11px 13px;font-weight:900}.btn.primary{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#171006}.btn.ghost{background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--text)}.btn.danger{background:rgba(239,68,68,.16);color:var(--red2);border:1px solid rgba(239,68,68,.24)}.tab{display:flex;gap:8px;overflow:auto;margin-bottom:14px}.tab button{white-space:nowrap;border:1px solid var(--line);background:rgba(255,255,255,.045);color:var(--muted);border-radius:999px;padding:10px 13px;font-weight:900}.table-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.table-card{padding:14px;min-height:158px}.table-card h3{margin:0;font-size:20px}.table-card .meta{display:flex;justify-content:space-between;align-items:center;margin-top:10px;color:var(--muted);font-size:12px}.table-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}.progress{height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;margin:9px 0}.progress span{display:block;height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));border-radius:999px}.dish-lines{display:grid;gap:7px;margin-top:10px}.dish-line{display:flex;justify-content:space-between;gap:10px;font-size:13px;color:var(--muted)}.chart{display:grid;gap:10px}.bar{display:grid;grid-template-columns:160px 1fr 90px;gap:10px;align-items:center}.bar-track{height:11px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}.bar-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--gold),var(--gold2))}.message-card{padding:14px}.message-card.urgent{border-color:rgba(239,68,68,.35);background:linear-gradient(145deg,rgba(239,68,68,.10),rgba(255,255,255,.025))}.message-top{display:flex;justify-content:space-between;gap:10px}.message-card blockquote{margin:10px 0 0;color:#eadfd4;line-height:1.45;border-left:3px solid var(--gold);padding-left:10px}.timeline{display:grid;gap:12px}.timeline-item{display:grid;grid-template-columns:20px 1fr;gap:12px}.dot{width:12px;height:12px;border-radius:50%;background:var(--gold2);margin-top:5px;box-shadow:0 0 0 5px rgba(247,211,123,.1)}.audit{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#cbd5e1;font-size:12px;background:rgba(0,0,0,.22);border-radius:16px;padding:14px;overflow:auto}.receipt-wrap{display:grid;place-items:center}.receipt{width:320px;background:#fff;color:#111;border-radius:10px;padding:18px 18px 24px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;box-shadow:0 26px 70px rgba(0,0,0,.42)}.receipt h3{font-family:Inter,system-ui,sans-serif;text-align:center;margin:0;font-size:22px;letter-spacing:.12em}.receipt .center{text-align:center}.receipt .muted2{color:#555;font-size:11px}.receipt .dash{border-top:1px dashed #111;margin:12px 0}.receipt-row{display:flex;justify-content:space-between;gap:8px;font-size:12px;margin:7px 0}.receipt-total{font-size:16px;font-weight:900}.receipt-qr{width:78px;height:78px;margin:12px auto 4px;background:repeating-linear-gradient(45deg,#111 0 6px,#fff 6px 12px);border:6px solid #fff;outline:2px solid #111}.print-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.config-card{border-radius:20px;background:rgba(255,255,255,.045);border:1px solid var(--line);padding:14px}.config-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.print-preview-note{color:var(--muted);font-size:12px;line-height:1.45}.drawer-lite{position:fixed;right:22px;top:22px;width:min(440px,calc(100vw - 44px));max-height:calc(100dvh - 44px);overflow:auto;z-index:60;border-radius:26px;background:#100d0a;border:1px solid var(--line);box-shadow:var(--shadow);padding:18px}.drawer-lite h2{font-family:'Playfair Display',serif;font-size:30px;margin:0}.tip-box{border-radius:18px;background:rgba(247,211,123,.08);border:1px solid rgba(247,211,123,.18);padding:14px}.tip-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.printer-card{border:1px solid rgba(96,165,250,.24);background:rgba(96,165,250,.08);border-radius:20px;padding:14px;margin-top:12px}.period-switch{display:flex;gap:8px;flex-wrap:wrap}.period-switch button{border:1px solid var(--line);background:rgba(255,255,255,.045);color:var(--muted);border-radius:999px;padding:10px 13px;font-weight:900}.period-switch button.on{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#171006}.sales-split{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.sales-mini{border-radius:18px;background:rgba(255,255,255,.045);border:1px solid var(--line);padding:14px}.sales-mini span{color:var(--muted);font-size:12px}.sales-mini strong{display:block;font-size:22px;margin-top:6px}.kitchen-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.kitchen-col{border-radius:22px;background:rgba(255,255,255,.04);border:1px solid var(--line);padding:14px}.kitchen-ticket{border-radius:18px;background:#18130f;border:1px solid rgba(255,255,255,.06);padding:12px;margin-top:10px}.kitchen-ticket h4{margin:0 0 6px}.kitchen-ticket p{margin:0;color:var(--muted);font-size:12px}.cash-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.cash-card{border-radius:20px;padding:16px;background:rgba(255,255,255,.045);border:1px solid var(--line)}.cash-card span{display:block;color:var(--muted);font-size:12px}.cash-card strong{display:block;font-size:24px;margin-top:8px}.shift-banner{border-radius:22px;padding:16px;background:linear-gradient(135deg,rgba(217,164,65,.14),rgba(255,255,255,.04));border:1px solid rgba(247,211,123,.22);display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}.shift-actions{display:flex;gap:8px;flex-wrap:wrap}.close-report{width:min(760px,100%);background:#fff;color:#111;border-radius:14px;padding:24px;font-family:Inter,system-ui,sans-serif}.close-report h2{font-family:Inter,system-ui,sans-serif;margin:0 0 6px;color:#111}.close-report .muted2{color:#555}.report-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}.report-box{border:1px solid #ddd;border-radius:10px;padding:12px}.report-box span{font-size:12px;color:#555}.report-box b{display:block;font-size:20px;margin-top:4px}.signature-line{border-top:1px solid #111;margin-top:34px;padding-top:8px;text-align:center}.whatsapp-card{border:1px solid rgba(52,211,153,.24);background:rgba(52,211,153,.08);border-radius:20px;padding:14px;margin-top:12px}.qr-card-admin{border-radius:20px;background:rgba(255,255,255,.045);border:1px solid var(--line);padding:14px}.qr-visual{width:112px;height:112px;border-radius:16px;background:repeating-linear-gradient(45deg,#fff 0 7px,#111 7px 14px);border:10px solid #fff;margin:0 auto 12px}.permission-table{width:100%;border-collapse:collapse}.permission-table th,.permission-table td{border-bottom:1px solid var(--line);padding:12px;text-align:left}.permission-table th{color:var(--gold2);font-size:12px}.permission-ok{color:var(--green);font-weight:900}.permission-no{color:var(--red2);font-weight:900}.inventory-low{border-color:rgba(239,68,68,.32)!important;background:linear-gradient(145deg,rgba(239,68,68,.09),rgba(255,255,255,.025))!important}.integration-log{max-height:260px;overflow:auto;display:grid;gap:8px}.log-row{border-radius:14px;background:rgba(0,0,0,.22);border:1px solid var(--line);padding:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#dbeafe}.log-row b{color:var(--gold2)}.status-dot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:7px;background:var(--green);box-shadow:0 0 0 4px rgba(52,211,153,.12)}.status-dot.off{background:var(--red);box-shadow:0 0 0 4px rgba(239,68,68,.12)}.endpoint-grid{display:grid;grid-template-columns:1fr;gap:10px}.endpoint-row{display:grid;grid-template-columns:150px 1fr auto;gap:10px;align-items:center}.demo-banner{border:1px solid rgba(96,165,250,.22);background:rgba(96,165,250,.08);border-radius:20px;padding:14px}.demo-banner b{color:#bfdbfe}@media print{body{background:#fff}.app,.sidebar,.mobile-top,.topbar,.panel:not(.print-target){display:none!important}.print-target{display:block!important;box-shadow:none!important;border:0!important}.receipt{box-shadow:none;border-radius:0;width:80mm}.main{padding:0}.receipt-wrap{display:block}}.mobile-top{display:none}@media(max-width:1050px){.app{grid-template-columns:1fr}.sidebar{display:none}.mobile-top{display:flex;position:sticky;top:0;z-index:20;background:rgba(7,6,4,.9);backdrop-filter:blur(18px);border-bottom:1px solid var(--line);padding:12px;gap:8px;overflow:auto}.mobile-top button{white-space:nowrap}.main{padding:14px}.kpis,.two,.three,.table-grid{grid-template-columns:1fr}.topbar{display:block}.operator{margin-top:12px}.title h1{font-size:34px}.row{grid-template-columns:1fr}.bar{grid-template-columns:1fr}.table-actions{grid-template-columns:1fr 1fr}}`;

// ─── Types ───────────────────────────────────────────────────────────────────
type BackofficeState = ReturnType<typeof useBackofficeState>;
type TableRow = BackofficeState["tables"][0];
type OrderRow2 = BackofficeState["orders"][0];
type CallRow2 = BackofficeState["calls"][0];
type MessageRow = BackofficeState["messages"][0];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getStaffById(staffList: StaffMember[], id: string | null): StaffMember | null {
  if (!id) return null;
  return staffList.find((s) => s.id === id) ?? null;
}

// ─── StaffAvatar ─────────────────────────────────────────────────────────────
interface StaffAvatarProps {
  staff: { name?: string; email?: string; avatarUrl?: string } | null;
  className?: string;
}
function StaffAvatar({ staff, className = "avatar" }: StaffAvatarProps) {
  const photoUrl =
    staff?.avatarUrl || (staff?.email ? STAFF_PHOTOS[staff.email] : undefined);
  if (photoUrl)
    return <img className={`${className} img`} src={photoUrl} alt={staff?.name ?? ""} />;
  return <div className={className}>{staff?.name?.[0] ?? "—"}</div>;
}

function statusBadge(status: string): string {
  const s = String(status).toLowerCase();
  if (
    s.includes("crítica") || s.includes("alta") || s.includes("cobro") ||
    s.includes("cocina") || s.includes("cancelado") || s.includes("cancelled")
  ) return "red";
  if (
    s.includes("listo") || s.includes("servido") || s.includes("activo") ||
    s.includes("plating") || s.includes("served")
  ) return "green";
  if (s.includes("preparando") || s.includes("esperando") || s.includes("prep")) return "blue";
  return "";
}

// ─── Layout ──────────────────────────────────────────────────────────────────
interface LayoutProps {
  role: StaffRole;
  tab: string;
  setTab: (t: string) => void;
  authStaff?: StaffProfile;
  onSignOut?: () => void;
  children: React.ReactNode;
}
function Layout({ role, tab, setTab, authStaff, onSignOut, children }: LayoutProps) {
  const adminTabs: [string, string, React.ReactNode][] = [
    ["dashboard", "Resumen", icons.dashboard],
    ["tables", "Mesas", icons.table],
    ["orders", "Platos/Pedidos", icons.order],
    ["kitchen", "Pantalla cocina", icons.kitchen],
    ["calls", "Llamados", icons.bell],
    ["messages", "Mensajes cliente", icons.chat],
    ["sales", "Ventas platos", icons.sales],
    ["staff", "Camareros", icons.users],
    ["inventory", "Inventario", icons.kitchen],
    ["qr", "QR Mesas", icons.table],
    ["menu", "Carta", icons.menu],
    ["reviews", "Reseñas", icons.star],
    ["settings", "Configuración", icons.settings],
  ];
  const waiterTabs: [string, string, React.ReactNode][] = [
    ["dashboard", "Mi turno", icons.dashboard],
    ["tables", "Mis mesas", icons.table],
    ["orders", "Estado platos", icons.order],
    ["kitchen", "Cocina", icons.kitchen],
    ["calls", "Llamados", icons.bell],
    ["messages", "Mensajes cliente", icons.chat],
    ["reviews", "Reseñas", icons.star],
  ];
  const tabs = role === "admin" ? adminTabs : waiterTabs;
  return (
    <div className="app">
      <style>{CSS}</style>
      <aside className="sidebar">
        <div className="brand">{RESTAURANT.name}<small>BACKOFFICE</small></div>
        <div className="role-card">
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <StaffAvatar staff={authStaff ? { name: authStaff.name, email: authStaff.email } : null} />
            <div>
              <b>{authStaff?.name ?? "—"}</b>
              <small style={{ display: "block", color: "var(--muted)", marginTop: 3 }}>
                {role === "admin" ? "Administrador" : "Camarero"}
              </small>
            </div>
          </div>
        </div>
        <nav className="nav">
          {tabs.map(([id, label, ic]) => (
            <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>
              {ic}<span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-footer" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span>Conectado a QR de mesas, cocina y panel de cliente.</span>
          {onSignOut && (
            <button
              className="btn danger"
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", marginTop: 8 }}
              onClick={onSignOut}
            >
              {icons.signout}<span>Cerrar sesión</span>
            </button>
          )}
        </div>
      </aside>
      <div className="mobile-top">
        {tabs.map(([id, label]) => (
          <button className={`btn ${tab === id ? "primary" : "ghost"}`} key={id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      <main className="main">{children}</main>
    </div>
  );
}

// ─── Topbar ──────────────────────────────────────────────────────────────────
function Topbar({ role, authStaff }: { role: StaffRole; authStaff?: StaffProfile }) {
  return (
    <div className="topbar">
      <div className="title">
        <h1>{role === "admin" ? "Control total del restaurante" : "Operación de camarero"}</h1>
        <p>{RESTAURANT.location} · Servicio {RESTAURANT.service}</p>
      </div>
      <div className="operator">
        <StaffAvatar staff={authStaff ? { name: authStaff.name, email: authStaff.email } : null} />
        <div>
          <b>{authStaff?.name ?? "—"}</b>
          <small style={{ display: "block", color: "var(--muted)" }}>{authStaff?.shift ?? ""}</small>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
interface RoleStaffState {
  role: StaffRole;
  staffId: string;
  state: BackofficeState;
}

function Dashboard({ role, staffId, state }: RoleStaffState) {
  const isAdmin = role === "admin";
  const staffTables = state.tables.filter((t) => isAdmin || t.waiterId === staffId);
  const staffOrders = state.orders.filter((o) => isAdmin || o.waiterId === staffId);
  const staffCalls = state.calls.filter((c) => isAdmin || c.waiterId === staffId);
  const pendingMessages = state.messages
    .filter((m) => {
      if (isAdmin) return true;
      const t = state.tables.find((t) => t.id === m.tableId);
      return t?.waiterId === staffId;
    })
    .filter((m) => m.status === "unread");
  const salesToday = state.tables.reduce((sum, t) => sum + t.bill, 0);
  return (
    <div className="grid">
      <div className="kpis">
        <div className="kpi"><span>{isAdmin ? "Mesas activas" : "Mis mesas"}</span><strong>{staffTables.filter((t) => t.status !== "Libre").length}</strong><small>{staffTables.length} asignadas/visibles</small></div>
        <div className="kpi"><span>Pedidos en curso</span><strong>{staffOrders.length}</strong><small>Incluye cocina y QR</small></div>
        <div className="kpi"><span>Llamados pendientes</span><strong>{staffCalls.filter((c) => c.status === "Pendiente").length}</strong><small>Mesa + cocina</small></div>
        <div className="kpi"><span>{isAdmin ? "Ventas hoy" : "Mensajes cliente"}</span><strong>{isAdmin ? money(salesToday) : pendingMessages.length}</strong><small>{isAdmin ? "Acumulado del servicio" : "Por atender"}</small></div>
      </div>
      <div className="two">
        <div className="panel">
          <div className="panel-head"><h2>Prioridad operativa</h2><span className="badge red">Live</span></div>
          <div className="list">{staffCalls.slice(0, 4).map((c) => <CallRowItem key={c.id} call={c} state={state} />)}</div>
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Mensajes del cliente</h2><span className="badge">QR</span></div>
          <div className="list">{pendingMessages.slice(0, 4).map((m) => <MessageCard key={m.id} msg={m} state={state} compact />)}</div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><h2>Estado de platos</h2><span className="badge blue">Cocina</span></div>
        <div className="list">{staffOrders.map((o) => <OrderRowItem key={o.id} order={o} state={state} />)}</div>
      </div>
    </div>
  );
}

// ─── Tables ──────────────────────────────────────────────────────────────────
function TablesView({ role, staffId, state }: RoleStaffState) {
  const isAdmin = role === "admin";
  const [selectedTable, setSelectedTable] = useState<TableRow | null>(null);
  const visible = state.tables.filter((t) => isAdmin || t.waiterId === staffId);
  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-head">
          <h2>{isAdmin ? "Mapa de mesas" : "Mesas que atiendo"}</h2>
          <span className="badge">{visible.length} mesas</span>
        </div>
        <div className="table-grid">
          {visible.map((t) => {
            const waiter = getStaffById(state.staff, t.waiterId);
            return (
              <div className="table-card" key={t.id}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <h3>Mesa {t.id}</h3>
                  <span className={`badge ${statusBadge(t.status)}`}>{t.status}</span>
                </div>
                <div className="meta"><span>{t.zone}</span><span>{t.guests} pax</span></div>
                <div className="meta"><span>Camarero</span><b>{waiter?.name ?? "Sin asignar"}</b></div>
                {isAdmin && <div className="meta"><span>Cuenta</span><b>{money(t.bill)}</b></div>}
                <div className="field" style={{ marginTop: 10 }}>
                  <label>Asignar camarero</label>
                  <select className="input" value={t.waiterId || ""} onChange={(e) => state.assignWaiter(t.id, e.target.value)}>
                    <option value="">Sin asignar</option>
                    {state.staff.filter((s) => s.role === "camarero").map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="table-actions">
                  <button className="btn primary" onClick={() => setSelectedTable(t)}>Atender</button>
                  <button className="btn ghost" onClick={() => setSelectedTable(t)}>Ver ficha</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedTable && (
        <TableDrawer table={selectedTable} role={role} state={state} onClose={() => setSelectedTable(null)} />
      )}
    </div>
  );
}

interface TableWithTip extends TableRow {
  tipAccepted?: boolean;
  tipAmount?: number;
}

function TableReceipt({ table, waiterName }: { table: TableWithTip; waiterName: string }) {
  const subtotal = table.bill;
  const tip = table.tipAmount ?? 0;
  const total = subtotal + tip;
  return (
    <div className="receipt-wrap">
      <div className="receipt">
        <h3>{RESTAURANT.name}</h3>
        <div className="center muted2">{RESTAURANT.legalName}<br />RUT {RESTAURANT.rut}<br />{RESTAURANT.address}<br />{RESTAURANT.phone} · {RESTAURANT.website}</div>
        <div className="dash" />
        <div className="center"><b>BOLETA MESA {table.id}</b><br /><span className="muted2">{new Date().toLocaleString("es-CL", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}</span></div>
        <div className="dash" />
        <div className="receipt-row"><span>Consumo mesa</span><b>{money(subtotal)}</b></div>
        <div className="receipt-row"><span>Propina 10%</span><b>{tip ? money(tip) : "No agregada"}</b></div>
        <div className="receipt-row"><span>IVA incluido</span><b>—</b></div>
        <div className="dash" />
        <div className="receipt-row receipt-total"><span>TOTAL</span><b>{money(total)}</b></div>
        <div className="receipt-row"><span>Atendió</span><b>{waiterName}</b></div>
        <div className="receipt-qr" />
        <div className="center muted2">Escanea para reseña Google</div>
        <div className="dash" />
        <div className="center muted2">Gracias por visitar NIDO · Vuelve pronto</div>
      </div>
    </div>
  );
}

function TableDrawer({ table, role, state, onClose }: { table: TableRow; role: StaffRole; state: BackofficeState; onClose: () => void }) {
  const liveTable = (state.tables.find((t) => t.id === table.id) ?? table) as TableWithTip;
  const [showReceipt, setShowReceipt] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [processing, setProcessing] = useState(false);
  const waiter = getStaffById(state.staff, liveTable.waiterId);
  const tableOrders = state.orders.filter((o) => o.tableId === liveTable.id);
  const tableMessages = state.messages.filter((m) => m.tableId === liveTable.id);
  const tipAccepted = liveTable.tipAccepted ?? false;
  // Bill calculated from real orders, fallback to table.bill
  const bill = tableOrders.reduce((sum, o) => sum + (o.total ?? 0), 0) || liveTable.bill;
  const suggestedTip = Math.round(bill * 0.1);
  const tipAmount = tipAccepted ? (liveTable.tipAmount || suggestedTip) : 0;
  const total = bill + tipAmount;

  const handleCobrar = async () => {
    setProcessing(true);
    await state.closeTable(liveTable.id, paymentMethod, bill, tipAmount);
    setProcessing(false);
    setShowReceipt(false);
    onClose();
  };
  return (
    <aside className="drawer-lite">
      <div className="panel-head">
        <div><h2>Ficha Mesa {liveTable.id}</h2><p style={{ margin: "4px 0 0" }}>Token QR {liveTable.qrToken} · {liveTable.zone}</p></div>
        <button className="btn ghost" onClick={onClose}>Cerrar</button>
      </div>
      <div className="list">
        <div className="row">
          <span className={`badge ${statusBadge(liveTable.status)}`}>{liveTable.status}</span>
          <div className="row-main"><b>{liveTable.guests} clientes</b><small>Camarero: {waiter?.name ?? "Sin asignar"}</small></div>
          <strong>{money(liveTable.bill)}</strong>
        </div>
        <div className="tip-box">
          <b>Propina sugerida 10%</b>
          <p style={{ margin: "6px 0", color: "var(--muted)" }}>El cliente decide si desea agregarla.</p>
          <div className="receipt-row" style={{ color: "var(--text)" }}><span>Subtotal mesa</span><b>{money(bill)}</b></div>
          <div className="receipt-row" style={{ color: "var(--text)" }}><span>Propina 10%</span><b>{tipAccepted ? money(tipAmount) : `${money(suggestedTip)} sugerida`}</b></div>
          <div className="receipt-row receipt-total" style={{ color: "var(--text)" }}><span>Total cobro</span><b>{money(total)}</b></div>
          <div className="tip-actions">
            <button className="btn primary" onClick={() => state.setTableTip(liveTable.id, true, suggestedTip)}>Agregar 10%</button>
            <button className="btn ghost" onClick={() => state.setTableTip(liveTable.id, false, suggestedTip)}>Sin propina</button>
          </div>
          <small style={{ display: "block", color: "var(--muted)", marginTop: 10 }}>Estado: {tipAccepted ? "propina aceptada" : "sin propina registrada"}</small>
        </div>
        <div className="panel" style={{ boxShadow: "none" }}>
          <h2>Pedidos</h2>
          {tableOrders.map((o) => (
            <p key={o.id} style={{ color: "var(--muted)" }}>
              <b>{o.id}</b> · {STATUS_DISPLAY[o.status] ?? o.status} · {o.items.map((i) => `${i.qty}× ${i.dish}`).join(", ")}
            </p>
          ))}
        </div>
        <div className="panel" style={{ boxShadow: "none" }}>
          <h2>Mensajes del cliente</h2>
          {tableMessages.map((m) => (
            <blockquote key={m.id} style={{ borderLeft: "3px solid var(--gold)", paddingLeft: 10, color: "#eadfd4" }}>{m.text}</blockquote>
          ))}
        </div>
        {(role === "admin" || role === "caja") && bill > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {(["cash", "card", "transfer"] as const).map((m) => (
                <button
                  key={m}
                  className={`btn ${paymentMethod === m ? "primary" : "ghost"}`}
                  style={{ flex: 1, fontSize: 12 }}
                  onClick={() => setPaymentMethod(m)}
                >
                  {m === "cash" ? "Efectivo" : m === "card" ? "Tarjeta" : "Transferencia"}
                </button>
              ))}
            </div>
            <button className="btn primary" onClick={() => setShowReceipt(true)}>
              Ver boleta · {money(total)}
            </button>
          </div>
        )}
        {showReceipt && (
          <div className="modal-backdrop">
            <div className="modal">
              <div className="panel-head">
                <div><h2>Confirmar cobro</h2><p style={{ margin: "4px 0 0" }}>Mesa {liveTable.id} · {paymentMethod === "cash" ? "Efectivo" : paymentMethod === "card" ? "Tarjeta" : "Transferencia"}</p></div>
                <button className="btn ghost" onClick={() => setShowReceipt(false)}>Cerrar</button>
              </div>
              <TableReceipt table={{ ...liveTable, bill }} waiterName={waiter?.name ?? "—"} />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
                <button className="btn ghost" onClick={() => setShowReceipt(false)}>Volver</button>
                <button className="btn ghost" onClick={() => window.print()}>Imprimir</button>
                <button className="btn primary" disabled={processing} onClick={handleCobrar}>
                  {processing ? "Procesando..." : `Cobrar ${money(total)}`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Orders ──────────────────────────────────────────────────────────────────
function OrdersView({ role, staffId, state }: RoleStaffState) {
  const visible = state.orders.filter((o) => role === "admin" || o.waiterId === staffId);
  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-head"><h2>Estado de platos y pedidos</h2><span className="badge blue">{visible.length} activos</span></div>
        <div className="list">{visible.map((o) => <OrderDetail key={o.id} order={o} state={state} role={role} />)}</div>
      </div>
    </div>
  );
}

function OrderRowItem({ order, state }: { order: OrderRow2; state: BackofficeState }) {
  const displayStatus = STATUS_DISPLAY[order.status] ?? order.status;
  return (
    <div className="row">
      <span className={`badge ${statusBadge(order.status)}`}>Mesa {order.tableId}</span>
      <div className="row-main">
        <b>{order.id} · {displayStatus}</b>
        <small>{order.items.map((i) => `${i.qty}× ${i.dish}`).join(" · ")}</small>
      </div>
      <button className="btn ghost" onClick={() => state.updateOrderStatus(order.id, "served")}>Marcar servido</button>
    </div>
  );
}

function OrderDetail({ order, state, role }: { order: OrderRow2; state: BackofficeState; role: StaffRole }) {
  const displayStatus = STATUS_DISPLAY[order.status] ?? order.status;
  const progress = order.status === "received" ? 25 : order.status === "prep" ? 55 : order.status === "plating" ? 90 : order.status === "served" ? 100 : 40;
  return (
    <div className="panel" style={{ boxShadow: "none" }}>
      <div className="panel-head">
        <div>
          <h2 style={{ fontSize: 24 }}>{order.id} · Mesa {order.tableId}</h2>
          <p style={{ margin: "5px 0 0" }}>Canal: {order.channel}</p>
        </div>
        <span className={`badge ${statusBadge(order.priority)}`}>{order.priority}</span>
      </div>
      <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      <div className="dish-lines">
        {order.items.map((item, idx) => (
          <div className="dish-line" key={`${order.id}-${idx}`}>
            <span>{item.qty}× {item.dish}</span><b>{item.status}</b>
          </div>
        ))}
      </div>
      <p>{order.notes}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn ghost" onClick={() => state.updateOrderStatus(order.id, "prep")}>Preparando</button>
        <button className="btn ghost" onClick={() => state.updateOrderStatus(order.id, "plating")}>Listo</button>
        <button className="btn primary" onClick={() => state.updateOrderStatus(order.id, "served")}>Servido</button>
        {role === "admin" && <button className="btn danger">Escalar incidencia</button>}
      </div>
      <p style={{ color: "var(--muted)", fontSize: 12 }}>Estado actual: {displayStatus}</p>
    </div>
  );
}

// ─── Calls ───────────────────────────────────────────────────────────────────
function CallsView({ role, staffId, state }: RoleStaffState) {
  const visible = state.calls.filter((c) => role === "admin" || c.waiterId === staffId);
  const mesa = visible.filter((c) => c.source === "mesa");
  const cocina = visible.filter((c) => c.source === "cocina");
  return (
    <div className="two">
      <div className="panel">
        <div className="panel-head"><h2>Llamados de mesa</h2><span className="badge">Cliente QR</span></div>
        <div className="list">{mesa.map((c) => <CallRowItem key={c.id} call={c} state={state} />)}</div>
      </div>
      <div className="panel">
        <div className="panel-head"><h2>Llamados de cocina</h2><span className="badge red">Cocina</span></div>
        <div className="list">{cocina.map((c) => <CallRowItem key={c.id} call={c} state={state} />)}</div>
      </div>
    </div>
  );
}

function CallRowItem({ call, state }: { call: CallRow2; state: BackofficeState }) {
  return (
    <div className="row">
      <span className={`badge ${statusBadge(call.priority)}`}>Mesa {call.tableId}</span>
      <div className="row-main">
        <b>{call.type}</b>
        <small>{call.message} · {call.status}</small>
      </div>
      <button className="btn primary" onClick={() => state.attendCall(call.id)}>Atender</button>
    </div>
  );
}

// ─── Messages ────────────────────────────────────────────────────────────────
function MessagesView({ role, staffId, state }: RoleStaffState) {
  const visible = state.messages.filter((m) => {
    if (role === "admin") return true;
    const t = state.tables.find((tbl) => tbl.id === m.tableId);
    return t?.waiterId === staffId;
  });
  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-head"><h2>Lo que el cliente escribe o pide</h2><span className="badge purple">Colaboración</span></div>
        <p>Admin puede colaborar cuando un camarero está ocupado.</p>
        <div className="three">{visible.map((m) => <MessageCard key={m.id} msg={m} state={state} />)}</div>
      </div>
    </div>
  );
}

function MessageCard({ msg, state, compact = false }: { msg: MessageRow; state: BackofficeState; compact?: boolean }) {
  const isUrgent = msg.status === "unread" || msg.text.toLowerCase().includes("alergia");
  return (
    <article className={`message-card ${isUrgent ? "urgent" : ""}`}>
      <div className="message-top">
        <div>
          <b>Mesa {msg.tableId}</b>
          <small style={{ display: "block", color: "var(--muted)", marginTop: 4 }}>
            {msg.fromRole} · {new Date(msg.createdAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
          </small>
        </div>
        <span className={`badge ${isUrgent ? "red" : msg.status === "read" ? "green" : ""}`}>{msg.status}</span>
      </div>
      <blockquote>{msg.text}</blockquote>
      {!compact && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn primary" onClick={() => state.resolveMessage(msg.id)}>Responder/Resolver</button>
          <button className="btn ghost">Asignar</button>
        </div>
      )}
    </article>
  );
}

// ─── Kitchen ─────────────────────────────────────────────────────────────────
function KitchenView({ state }: { state: BackofficeState }) {
  const columns: Record<string, OrderRow2[]> = {
    received: state.orders.filter((o) => o.status === "received"),
    preparing: state.orders.filter((o) => o.status === "prep"),
    ready: state.orders.filter((o) => o.status === "plating"),
    delivered: state.orders.filter((o) => o.status === "served"),
  };
  const nextStatus: Record<string, OrderStatus> = {
    received: "prep",
    preparing: "plating",
    ready: "served",
  };
  const nextLabel: Record<string, string> = {
    received: "Preparando",
    preparing: "Listo para servir",
    ready: "Servido",
  };
  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-head">
          <div><h2>Pantalla cocina</h2><p style={{ margin: "4px 0 0" }}>Flujo operativo en tiempo real.</p></div>
          <span className="badge red">LIVE</span>
        </div>
        <div className="kitchen-board">
          {Object.entries(KITCHEN_COLUMNS).map(([key, label]) => (
            <div className="kitchen-col" key={key}>
              <div className="panel-head"><h2 style={{ fontSize: 22 }}>{label}</h2><span className="badge">{columns[key]?.length ?? 0}</span></div>
              {(columns[key] ?? []).map((o) => (
                <div className="kitchen-ticket" key={o.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <h4>{o.id}</h4>
                    <span className={`badge ${statusBadge(o.priority)}`}>{o.priority}</span>
                  </div>
                  <p>Mesa {o.tableId}</p>
                  <div className="dish-lines">
                    {o.items.map((i, idx) => (
                      <div className="dish-line" key={idx}><span>{i.qty}× {i.dish}</span><b>{i.status}</b></div>
                    ))}
                  </div>
                  <p style={{ marginTop: 10 }}>ETA {o.eta} min</p>
                  {nextStatus[key] && (
                    <button className="btn primary" style={{ width: "100%", marginTop: 10 }} onClick={() => state.updateOrderStatus(o.id, nextStatus[key])}>
                      {nextLabel[key]}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Cash ─────────────────────────────────────────────────────────────────────
function CashCloseReport({ session }: { session: BackofficeState["cashSession"] }) {
  const expected = session.cash + session.card + session.transfer + session.tips - session.expenses;
  return (
    <div className="close-report">
      <h2>Cierre de caja</h2>
      <div className="muted2">{RESTAURANT.legalName} · RUT {RESTAURANT.rut}<br />Turno {session.turn} · Apertura {session.openedAt}</div>
      <div className="report-grid">
        <div className="report-box"><span>Fondo inicial</span><b>{money(session.openingCash)}</b></div>
        <div className="report-box"><span>Efectivo</span><b>{money(session.cash)}</b></div>
        <div className="report-box"><span>Tarjeta</span><b>{money(session.card)}</b></div>
        <div className="report-box"><span>Transferencia</span><b>{money(session.transfer)}</b></div>
        <div className="report-box"><span>Propinas</span><b>{money(session.tips)}</b></div>
        <div className="report-box"><span>Gastos</span><b>{money(session.expenses)}</b></div>
        <div className="report-box"><span>Total esperado</span><b>{money(expected)}</b></div>
        <div className="report-box"><span>Diferencia</span><b>{money(0)}</b></div>
      </div>
      <div className="signature-line">Firma responsable</div>
    </div>
  );
}

function CashClosingView({ state, staffId }: { state: BackofficeState; staffId: string }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [turn, setTurn] = useState(state.cashSession.turn);
  const session = state.cashSession;
  const whatsappText = encodeURIComponent(`Cierre de caja ${RESTAURANT.name}\nTurno: ${session.turn}\nEfectivo: ${money(session.cash)}\nTarjeta: ${money(session.card)}\nTransferencia: ${money(session.transfer)}\nPropinas: ${money(session.tips)}`);
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
  const downloadReport = () => {
    const text = `CIERRE DE CAJA - ${RESTAURANT.name}\nTurno: ${session.turn}\nEfectivo: ${money(session.cash)}\nTarjeta: ${money(session.card)}\nTransferencia: ${money(session.transfer)}\nPropinas: ${money(session.tips)}\nGastos: ${money(session.expenses)}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cierre-caja-${session.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="grid">
      <div className="shift-banner">
        <div>
          <h2 style={{ margin: 0, fontFamily: "Playfair Display", fontSize: 30 }}>Caja {session.status}</h2>
          <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>Turno {session.turn} · Apertura {session.openedAt}</p>
        </div>
        <div className="shift-actions">
          <button className="btn primary" onClick={() => state.openCash(staffId)}>Abrir caja</button>
          <button className="btn danger" onClick={() => state.closeCash()}>Cerrar caja</button>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div><h2>Cambio de turno</h2><p style={{ margin: "4px 0 0" }}>Cada acción queda registrada.</p></div>
          <span className={`badge ${session.status === "abierta" ? "green" : "red"}`}>{session.status}</span>
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Turno activo</label>
            <select className="input" value={turn} onChange={(e) => setTurn(e.target.value)}>
              <option>Mañana</option><option>Tarde</option><option>Noche</option><option>Extra</option>
            </select>
          </div>
        </div>
        <button className="btn primary" style={{ marginTop: 12 }} onClick={() => state.changeTurn(turn)}>Cambiar turno</button>
      </div>
      <ExpenseRegister state={state} staffId={staffId} />
      <div className="panel">
        <div className="panel-head">
          <div><h2>Cierre de caja</h2></div>
          <span className="badge green">Cuadrado</span>
        </div>
        <div className="cash-grid">
          <div className="cash-card"><span>Efectivo</span><strong>{money(session.cash)}</strong></div>
          <div className="cash-card"><span>Tarjeta</span><strong>{money(session.card)}</strong></div>
          <div className="cash-card"><span>Transferencia</span><strong>{money(session.transfer)}</strong></div>
          <div className="cash-card"><span>Propinas</span><strong>{money(session.tips)}</strong></div>
          <div className="cash-card"><span>Gastos</span><strong>{money(session.expenses)}</strong></div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button className="btn primary" onClick={() => setReportOpen(true)}>Ver cierre</button>
          <button className="btn ghost" onClick={() => window.print()}>Imprimir</button>
          <button className="btn ghost" onClick={downloadReport}>Descargar</button>
          <button className="btn ghost" onClick={() => setWhatsappOpen(true)}>WhatsApp</button>
        </div>
      </div>
      {reportOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="panel-head"><h2>Reporte de cierre</h2><button className="btn ghost" onClick={() => setReportOpen(false)}>Cerrar</button></div>
            <CashCloseReport session={session} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
              <button className="btn ghost" onClick={downloadReport}>Descargar</button>
              <button className="btn primary" onClick={() => window.print()}>Imprimir</button>
            </div>
          </div>
        </div>
      )}
      {whatsappOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="panel-head"><h2>Enviar cierre por WhatsApp</h2><button className="btn ghost" onClick={() => setWhatsappOpen(false)}>Cerrar</button></div>
            <div className="whatsapp-card">
              <b>Mensaje listo para enviar</b>
              <p style={{ color: "var(--muted)", lineHeight: 1.5 }}>Resumen de cierre, métodos de pago y propinas.</p>
              <a className="btn primary" style={{ display: "inline-block", textDecoration: "none" }} href={whatsappUrl} target="_blank" rel="noreferrer">Abrir WhatsApp</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpenseRegister({ state }: { state: BackofficeState; staffId: string }) {
  const [form, setForm] = useState({ type: "Caja", detail: "", amount: "" });
  const submit = () => {
    if (!form.detail.trim() || !Number(form.amount)) return alert("Detalle y monto son requeridos");
    state.addExpense(form.type, form.detail, Number(form.amount));
    setForm({ type: "Caja", detail: "", amount: "" });
  };
  return (
    <div className="panel">
      <div className="panel-head">
        <div><h2>Gastos del turno</h2><p style={{ margin: "4px 0 0" }}>Afecta el cierre de caja.</p></div>
        <span className="badge red">Egresos</span>
      </div>
      <div className="form-grid">
        <div className="field">
          <label>Tipo</label>
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option>Caja</option><option>Proveedor</option><option>Emergencia</option><option>Operativo</option>
          </select>
        </div>
        <div className="field">
          <label>Monto</label>
          <input className="input" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </div>
        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label>Detalle</label>
          <input className="input" value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} placeholder="Ej: compra hielo..." />
        </div>
      </div>
      <button className="btn primary" style={{ marginTop: 12 }} onClick={submit}>Registrar gasto</button>
      <div className="list" style={{ marginTop: 14 }}>
        {state.expenses.map((e) => (
          <div className="row" key={e.id}>
            <span className="badge red">{e.type}</span>
            <div className="row-main"><b>{e.detail}</b></div>
            <strong>{money(e.amount)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sales ───────────────────────────────────────────────────────────────────
function SalesView() {
  const [period, setPeriod] = useState("day");
  const current = SALES_PERIODS[period];
  const total = MENU_SALES.reduce((s, d) => s + d.revenue, 0);
  const max = Math.max(...MENU_SALES.map((d) => d.revenue));
  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-head">
          <div><h2>Ventas por periodo</h2><p style={{ margin: "4px 0 0" }}>Incluye control de propina 10%.</p></div>
          <div className="period-switch">
            {Object.entries(SALES_PERIODS).map(([key, p]) => (
              <button key={key} className={period === key ? "on" : ""} onClick={() => setPeriod(key)}>{p.label}</button>
            ))}
          </div>
        </div>
        <div className="sales-split">
          <div className="sales-mini"><span>Ventas {current.label.toLowerCase()}</span><strong>{money(current.sales)}</strong></div>
          <div className="sales-mini"><span>Propina 10%</span><strong>{money(current.tips)}</strong></div>
          <div className="sales-mini"><span>Tickets</span><strong>{current.tickets}</strong></div>
          <div className="sales-mini"><span>Ticket promedio</span><strong>{money(current.avgTicket)}</strong></div>
        </div>
      </div>
      <div className="kpis">
        <div className="kpi"><span>Ventas platos</span><strong>{money(total)}</strong><small>Acumulado del servicio</small></div>
        <div className="kpi"><span>Plato top</span><strong>{MENU_SALES[0].sold}</strong><small>{MENU_SALES[0].dish}</small></div>
        <div className="kpi"><span>Propina registrada</span><strong>{money(current.tips)}</strong><small>Separada de ventas</small></div>
        <div className="kpi"><span>Stock bajo</span><strong>{MENU_SALES.filter((d) => d.stock === "Bajo").length}</strong><small>Revisar cocina</small></div>
      </div>
      <div className="panel">
        <div className="panel-head"><h2>Registro de ventas por plato</h2><span className="badge green">Admin</span></div>
        <div className="chart">
          {MENU_SALES.map((d) => (
            <div className="bar" key={d.id}>
              <b>{d.dish}</b>
              <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(8, d.revenue / max * 100)}%` }} /></div>
              <span>{money(d.revenue)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><h2>Detalle de platos</h2></div>
        <div className="list">
          {MENU_SALES.map((d) => (
            <div className="row" key={d.id}>
              <span className={`badge ${d.stock === "Bajo" ? "red" : "green"}`}>{d.stock}</span>
              <div className="row-main"><b>{d.dish}</b><small>{d.category} · vendidos: {d.sold} · prep promedio: {d.avgPrep} min</small></div>
              <strong>{money(d.revenue)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Inventory ───────────────────────────────────────────────────────────────
function InventoryView({ state }: { state: BackofficeState }) {
  const low = state.inventory.filter((i) => i.stock <= i.minStock);
  return (
    <div className="grid">
      <div className="kpis">
        <div className="kpi"><span>Ingredientes</span><strong>{state.inventory.length}</strong><small>Control operativo</small></div>
        <div className="kpi"><span>Stock bajo</span><strong>{low.length}</strong><small>Ocultar platos si aplica</small></div>
        <div className="kpi"><span>Platos afectados</span><strong>{low.reduce((s, i) => s + i.linkedDishes.length, 0)}</strong><small>Conexión con carta cliente</small></div>
        <div className="kpi"><span>Actualización</span><strong>Live</strong><small>Cocina/Admin</small></div>
      </div>
      <div className="panel">
        <div className="panel-head"><div><h2>Inventario básico</h2></div><span className="badge red">Stock crítico</span></div>
        <div className="list">
          {state.inventory.map((i) => {
            const isLow = i.stock <= i.minStock;
            return (
              <div className={`row ${isLow ? "inventory-low" : ""}`} key={i.id}>
                <span className={`badge ${isLow ? "red" : "green"}`}>{isLow ? "Bajo" : "OK"}</span>
                <div className="row-main">
                  <b>{i.name}</b>
                  <small>{i.category} · mínimo {i.minStock} {i.unit} · afecta: {i.linkedDishes.join(", ")}</small>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input className="input" style={{ width: 90 }} type="number" value={i.stock}
                    onChange={(e) => state.updateInventoryStock(i.id, Number(e.target.value) - i.stock)} />
                  <strong>{i.unit}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── QR ──────────────────────────────────────────────────────────────────────
function QRView({ state }: { state: BackofficeState }) {
  const baseUrl = "https://app.tusistema.com/q/";
  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-head">
          <div><h2>QR de mesas</h2><p style={{ margin: "4px 0 0" }}>Una sola app de cliente; cada mesa usa token QR interno.</p></div>
          <span className="badge blue">Tokens</span>
        </div>
        <div className="three">
          {state.qrTokens.map((q) => (
            <div className="qr-card-admin" key={q.tableId}>
              <div className="qr-visual" />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <h3 style={{ margin: 0 }}>Mesa {q.tableId}</h3>
                <span className={`badge ${q.active ? "green" : "red"}`}>{q.active ? "Activo" : "Inactivo"}</span>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 12, wordBreak: "break-all" }}>{baseUrl}{q.token}</p>
              <div className="table-actions">
                <button className="btn ghost" onClick={() => state.toggleQr(q.tableId)}>{q.active ? "Desactivar" : "Activar"}</button>
                <button className="btn primary" onClick={() => state.regenerateQr(q.tableId)}>Regenerar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Staff ───────────────────────────────────────────────────────────────────
function StaffView({ state }: { state: BackofficeState }) {
  const [editing, setEditing] = useState<StaffMember | null>(null);
  return (
    <div className="grid">
      <div className="panel">
        <div className="panel-head"><h2>Camareros y empleados</h2><span className="badge green">Fotos + trazabilidad</span></div>
        <div className="three">
          {state.staff.map((s) => (
            <div className="table-card" key={s.id}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <StaffAvatar staff={s} className="staff-photo" />
                <div>
                  <h3>{s.name}</h3>
                  <p style={{ margin: "3px 0", color: "var(--muted)" }}>{s.role === "admin" ? "Administrador" : "Camarero"} · {s.shift}</p>
                </div>
              </div>
              <div className="meta"><span>Estado</span><span className={`badge ${s.status === "Activo" ? "green" : ""}`}>{s.status}</span></div>
              <div className="meta"><span>Mesas</span><b>{s.tables.length ? s.tables.map((t) => `#${t}`).join(", ") : "—"}</b></div>
              <div className="meta"><span>Contacto</span><b>{s.phone}</b></div>
              <div className="meta">
                <span>Ventas mesas</span>
                <b>{money(state.tables.filter((t) => t.waiterId === s.id).reduce((sum, t) => sum + t.bill, 0))}</b>
              </div>
              <button className="btn ghost" style={{ width: "100%", marginTop: 12 }} onClick={() => setEditing(s)}>Editar foto/datos</button>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>Quién atendió cada mesa</h2>
        <div className="list">
          {state.tables.filter((t) => t.waiterId).map((t) => {
            const w = getStaffById(state.staff, t.waiterId);
            return (
              <div className="row" key={t.id}>
                <span className="badge">Mesa {t.id}</span>
                <div className="row-main"><b>{w?.name ?? "Sin asignar"}</b><small>{t.zone} · {t.guests} clientes · {t.status}</small></div>
                <strong>{money(t.bill)}</strong>
              </div>
            );
          })}
        </div>
      </div>
      {editing && <StaffEditor staff={editing} state={state} onClose={() => setEditing(null)} />}
    </div>
  );
}

function StaffEditor({ staff, state, onClose }: { staff: StaffMember; state: BackofficeState; onClose: () => void }) {
  const [form, setForm] = useState(staff);
  const [uploading, setUploading] = useState(false);
  const update = <K extends keyof StaffMember>(key: K, value: StaffMember[K]) => setForm((f) => ({ ...f, [key]: value }));
  const photoUrl = form.avatarUrl || (form.email ? STAFF_PHOTOS[form.email] : undefined);
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="panel-head">
          <div><h2>Editar empleado</h2></div>
          <button className="btn ghost" onClick={onClose}>Cerrar</button>
        </div>
        <div className="two" style={{ gridTemplateColumns: ".7fr 1.3fr" }}>
          <div className="image-upload">
            {photoUrl
              ? <img className="dish-thumb big" src={photoUrl} alt={form.name} />
              : <div className="dish-thumb big" style={{ display: "grid", placeItems: "center", fontSize: 48, fontWeight: 900 }}>{form.name[0]}</div>
            }
            <div className="field">
              <label>Foto empleado</label>
              <label style={{ cursor: uploading ? "wait" : "pointer" }}>
                <span className="btn ghost" style={{ display: "block", textAlign: "center" }}>{uploading ? "Subiendo…" : "Subir foto"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    setUploading(true);
                    const url = await uploadStaffAvatar(file, form.id);
                    if (url) { update("avatarUrl", url); state.saveStaffAvatar(form.id, url); }
                    setUploading(false);
                  }} />
              </label>
              <input className="input" style={{ marginTop: 8 }} value={form.avatarUrl || ""} onChange={(e) => update("avatarUrl", e.target.value)} placeholder="O pega URL de imagen" />
            </div>
            <div className="image-actions">
              <button className="btn ghost" onClick={() => update("avatarUrl", STAFF_PHOTOS["marco@nido.cl"])}>Hombre</button>
              <button className="btn ghost" onClick={() => update("avatarUrl", STAFF_PHOTOS["isabella@nido.cl"])}>Mujer</button>
            </div>
          </div>
          <div className="form-grid">
            <div className="field"><label>Nombre</label><input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} /></div>
            <div className="field"><label>Rol</label>
              <select className="input" value={form.role} onChange={(e) => update("role", e.target.value as StaffRole)}>
                <option value="camarero">Camarero</option><option value="admin">Admin</option>
              </select>
            </div>
            <div className="field"><label>Turno</label><input className="input" value={form.shift} onChange={(e) => update("shift", e.target.value)} /></div>
            <div className="field"><label>Estado</label>
              <select className="input" value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option>Activo</option><option>Pausa</option><option>Inactivo</option>
              </select>
            </div>
            <div className="field"><label>Teléfono</label><input className="input" value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} /></div>
            <div className="field"><label>Email</label><input className="input" value={form.email || ""} onChange={(e) => update("email", e.target.value)} /></div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={onClose}>Guardar cambios</button>
        </div>
      </div>
    </div>
  );
}

// ─── Menu ────────────────────────────────────────────────────────────────────
function MenuView({ state }: { state: BackofficeState }) {
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const openNew = () => setEditing({
    id: `dish-${Date.now()}`, name: "", subtitle: "", category: "Principales",
    description: "", price: 0, avgPrepMinutes: 15, kcal: 0, tags: [], allergens: [],
    winePair: "", imageUrl: "", stockStatus: "ok", available: true, visibleClient: true,
  });
  const visibleClient = state.menuItems.filter((d) => d.available && d.visibleClient);
  return (
    <div className="grid">
      <div className="two">
        <div className="panel">
          <div className="panel-head">
            <div><h2>Carta operativa</h2><p style={{ margin: "4px 0 0" }}>Admin crea/edita platos.</p></div>
            <button className="btn primary" onClick={openNew}>Nuevo plato</button>
          </div>
          <div className="list">
            {state.menuItems.map((d) => (
              <div className="row" key={d.id}>
                <span className={`badge ${d.available ? "green" : "red"}`}>{d.available ? "Activo" : "Oculto"}</span>
                <img className="dish-thumb" src={d.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=900&auto=format&fit=crop"} alt={d.name} />
                <div className="row-main">
                  <b>{d.name}</b>
                  <small>{d.category} · {money(d.price)} · Prep {d.avgPrepMinutes} min · Tags: {Array.isArray(d.tags) ? d.tags.join(", ") : d.tags || "—"}</small>
                  <small>{d.description}</small>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button className="btn ghost" onClick={() => setEditing(d)}>Editar</button>
                  <button className="btn ghost" onClick={() => state.toggleMenuAvailability(d.id)}>{d.available ? "Desactivar" : "Activar"}</button>
                  <button className="btn danger" onClick={() => state.deleteMenuItem(d.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Vista cliente QR</h2><span className="badge blue">Sincronizada</span></div>
          <div className="preview-phone">
            {visibleClient.length ? visibleClient.map((d) => (
              <div className="client-dish" key={d.id}>
                <div style={{ display: "flex", gap: 12 }}>
                  <img className="dish-thumb" src={d.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=900&auto=format&fit=crop"} alt={d.name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <h4>{d.name}</h4><b>{money(d.price)}</b>
                    </div>
                    <p>{d.description}</p>
                    <small style={{ color: "var(--gold2)", fontWeight: 900 }}>{d.category} · {d.avgPrepMinutes} min</small>
                  </div>
                </div>
              </div>
            )) : <p style={{ color: "var(--muted)" }}>No hay platos visibles para el cliente.</p>}
          </div>
        </div>
      </div>
      {editing && <MenuEditor item={editing} onClose={() => setEditing(null)} onSave={(item) => { state.saveMenuItem(item); setEditing(null); }} />}
    </div>
  );
}

function MenuEditor({ item, onClose, onSave }: { item: MenuItem; onClose: () => void; onSave: (item: MenuItem) => void }) {
  const [form, setForm] = useState(item);
  const [uploading, setUploading] = useState(false);
  const update = <K extends keyof MenuItem>(key: K, value: MenuItem[K]) => setForm((f) => ({ ...f, [key]: value }));
  const submit = () => {
    if (!form.name.trim()) return alert("Nombre del plato requerido");
    if (!Number(form.price)) return alert("Precio requerido");
    onSave({ ...form, price: Number(form.price), avgPrepMinutes: Number(form.avgPrepMinutes || 0) });
  };
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="panel-head">
          <div><h2>{item.name ? "Editar plato" : "Nuevo plato"}</h2><p style={{ margin: "4px 0 0" }}>Datos para carta cliente QR y cocina.</p></div>
          <button className="btn ghost" onClick={onClose}>Cerrar</button>
        </div>
        <div className="two" style={{ gridTemplateColumns: ".8fr 1.2fr", marginBottom: 12 }}>
          <div className="image-upload">
            <img className="dish-thumb big" src={form.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=900&auto=format&fit=crop"} alt="Preview plato" />
            <div className="field">
              <label>Imagen del plato</label>
              <label style={{ cursor: uploading ? "wait" : "pointer" }}>
                <span className="btn ghost" style={{ display: "block", textAlign: "center", marginBottom: 8 }}>{uploading ? "Subiendo…" : "Subir foto"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    setUploading(true);
                    const url = await uploadMenuImage(file, form.id || `dish-${Date.now()}`);
                    if (url) update("imageUrl", url);
                    setUploading(false);
                  }} />
              </label>
              <input className="input" value={form.imageUrl || ""} onChange={(e) => update("imageUrl", e.target.value)} placeholder="URL de imagen o CDN" />
            </div>
            <div className="image-actions">
              <button className="btn ghost" onClick={() => update("imageUrl", "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=900&auto=format&fit=crop")}>Pasta</button>
              <button className="btn ghost" onClick={() => update("imageUrl", "https://images.unsplash.com/photo-1535400255456-984241443b29?q=80&w=900&auto=format&fit=crop")}>Pescado</button>
              <button className="btn ghost" onClick={() => update("imageUrl", "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=900&auto=format&fit=crop")}>Postre</button>
            </div>
            <small style={{ color: "var(--muted)" }}>Sube una foto o pega una URL.</small>
          </div>
          <div>
            <div className="form-grid">
              <div className="field"><label>Nombre</label><input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ej: Ravioli al Limone" /></div>
              <div className="field"><label>Categoría</label>
                <select className="input" value={form.category} onChange={(e) => update("category", e.target.value)}>
                  <option>Entradas</option><option>Principales</option><option>Pastas</option><option>Pescados</option><option>Carnes</option><option>Postres</option><option>Bebidas</option><option>Promos</option>
                </select>
              </div>
              <div className="field"><label>Precio</label><input className="input" type="number" value={form.price} onChange={(e) => update("price", Number(e.target.value))} /></div>
              <div className="field"><label>Tiempo prep min</label><input className="input" type="number" value={form.avgPrepMinutes} onChange={(e) => update("avgPrepMinutes", Number(e.target.value))} /></div>
              <div className="field"><label>Stock</label>
                <select className="input" value={form.stockStatus} onChange={(e) => update("stockStatus", e.target.value)}>
                  <option value="ok">OK</option><option value="low">Bajo</option><option value="out">Agotado</option>
                </select>
              </div>
              <div className="field"><label>Tags (coma)</label>
                <input className="input" value={Array.isArray(form.tags) ? form.tags.join(",") : (form.tags as unknown as string) || ""} onChange={(e) => update("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} placeholder="TOP,CHEF,Sin gluten" />
              </div>
            </div>
            <div className="field" style={{ marginTop: 10 }}><label>Descripción visible en cliente</label><textarea className="textarea" value={form.description} onChange={(e) => update("description", e.target.value)} /></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", margin: "14px 0" }}>
          <label className="toggle"><input type="checkbox" checked={form.available} onChange={(e) => update("available", e.target.checked)} /> Activo en carta</label>
          <label className="toggle"><input type="checkbox" checked={form.visibleClient} onChange={(e) => update("visibleClient", e.target.checked)} /> Visible para cliente QR</label>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={submit}>Guardar y publicar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
function ReviewsView({ role, staffId, state }: RoleStaffState) {
  const visible = state.reviews.filter((r) => role === "admin" || r.waiterId === staffId);
  return (
    <div className="panel">
      <div className="panel-head"><h2>Reseñas y experiencia</h2><span className="badge">QR + internas</span></div>
      <div className="list">
        {visible.map((r) => (
          <div className="row" key={r.id}>
            <span className={`badge ${r.rating >= 4 ? "green" : ""}`}>Mesa {r.tableId}</span>
            <div className="row-main">
              <b style={{ color: "var(--gold2)" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</b>
              <small>{r.comment} · {new Date(r.createdAt).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}</small>
            </div>
            <span className={`badge ${r.source === "QR Mesa" ? "green" : ""}`}>{r.source}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Receipt preview ──────────────────────────────────────────────────────────
function ReceiptPreview({ receiptConfig, restaurant }: { receiptConfig: typeof RECEIPT_CONFIG; restaurant: typeof RESTAURANT }) {
  const subtotal = RECEIPT_ITEMS.reduce((s, i) => s + i.qty * i.price, 0);
  const service = Math.round(subtotal * 0.1);
  const total = subtotal + service;
  return (
    <div className="receipt-wrap">
      <div className="receipt">
        <h3>{restaurant.name}</h3>
        <div className="center muted2">{restaurant.legalName}<br />RUT {restaurant.rut}<br />{restaurant.address}<br />{restaurant.phone} · {restaurant.website}</div>
        <div className="dash" />
        <div className="center"><b>{receiptConfig.title}</b><br /><span className="muted2">Mesa 7 · {new Date().toLocaleString("es-CL", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}</span></div>
        <div className="dash" />
        {RECEIPT_ITEMS.map((i) => <div className="receipt-row" key={i.name}><span>{i.qty}× {i.name}</span><b>{money(i.qty * i.price)}</b></div>)}
        <div className="dash" />
        <div className="receipt-row"><span>Subtotal</span><b>{money(subtotal)}</b></div>
        <div className="receipt-row"><span>Servicio 10%</span><b>{money(service)}</b></div>
        <div className="receipt-row"><span>{receiptConfig.taxLabel}</span><b>—</b></div>
        <div className="receipt-row receipt-total"><span>TOTAL</span><b>{money(total)}</b></div>
        {receiptConfig.showWaiter && <div className="receipt-row"><span>Atendió</span><b>Marco</b></div>}
        {receiptConfig.showQr && <><div className="receipt-qr" /><div className="center muted2">Escanea para reseña Google</div></>}
        <div className="dash" />
        <div className="center muted2">{receiptConfig.footer}</div>
      </div>
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────
function SettingsView({ state }: { state: BackofficeState }) {
  const [restaurant, setRestaurant] = useState(RESTAURANT);
  const [receiptConfig, setReceiptConfig] = useState(RECEIPT_CONFIG);
  const [showPrinterPanel, setShowPrinterPanel] = useState(true);
  const [webhooks, setWebhooks] = useState<Record<string, string>>({ ...WEBHOOKS });
  const [logs, setLogs] = useState([
    { time: "20:45", event: "SYSTEM_READY", status: "ok", detail: "Sistema conectado a Supabase y n8n." },
  ]);
  const updateRestaurant = (key: keyof typeof RESTAURANT, value: string) =>
    setRestaurant((r) => ({ ...r, [key]: value }));
  const updateReceipt = (key: keyof typeof RECEIPT_CONFIG, value: unknown) =>
    setReceiptConfig((r) => ({ ...r, [key]: value }));
  const printReceipt = () => {
    setLogs((rows) => [{ time: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }), event: "PRINT_PREVIEW", status: "ok", detail: "window.print() ejecutado." }, ...rows]);
    window.print();
  };
  const updateWebhook = (key: string, value: string) => setWebhooks((w) => ({ ...w, [key]: value }));
  const simulateWebhook = async (event: string) => {
    const payload = { event, restaurantId: "nido", tableId: 7, qrToken: "A7K92", source: "admin", createdAt: new Date().toISOString() };
    const demoMode = state.demoMode;
    setLogs((rows) => [{
      time: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
      event, status: demoMode ? "demo" : "pending",
      detail: demoMode ? `Simulado local: ${JSON.stringify(payload)}` : `POST ${webhooks[event] || "sin endpoint"}`
    }, ...rows]);
    if (!demoMode && webhooks[event]) {
      try {
        await fetch(webhooks[event], { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        setLogs((rows) => [{ time: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }), event, status: "ok", detail: `Enviado a ${webhooks[event]}` }, ...rows]);
      } catch (err) {
        setLogs((rows) => [{ time: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }), event, status: "error", detail: String((err as Error)?.message || err) }, ...rows]);
      }
    }
  };
  return (
    <div className="grid">
      <div className="two">
        <div className="panel">
          <div className="panel-head"><h2>Datos del restaurante</h2><span className="badge green">Boleta</span></div>
          <div className="config-grid">
            <div className="field"><label>Nombre comercial</label><input className="input" value={restaurant.name} onChange={(e) => updateRestaurant("name", e.target.value)} /></div>
            <div className="field"><label>Razón social</label><input className="input" value={restaurant.legalName} onChange={(e) => updateRestaurant("legalName", e.target.value)} /></div>
            <div className="field"><label>RUT</label><input className="input" value={restaurant.rut} onChange={(e) => updateRestaurant("rut", e.target.value)} /></div>
            <div className="field"><label>Teléfono</label><input className="input" value={restaurant.phone} onChange={(e) => updateRestaurant("phone", e.target.value)} /></div>
            <div className="field" style={{ gridColumn: "1/-1" }}><label>Dirección</label><input className="input" value={restaurant.address} onChange={(e) => updateRestaurant("address", e.target.value)} /></div>
            <div className="field"><label>Web</label><input className="input" value={restaurant.website} onChange={(e) => updateRestaurant("website", e.target.value)} /></div>
            <div className="field"><label>Impresora</label><input className="input" value={receiptConfig.printer} onChange={(e) => updateReceipt("printer", e.target.value)} /></div>
            <div className="field"><label>IP impresora</label><input className="input" value={receiptConfig.printerIp} onChange={(e) => updateReceipt("printerIp", e.target.value)} /></div>
            <div className="field"><label>Ancho papel</label>
              <select className="input" value={receiptConfig.paperWidth} onChange={(e) => updateReceipt("paperWidth", e.target.value)}>
                <option>58mm</option><option>80mm</option>
              </select>
            </div>
            <div className="field"><label>Modo impresión</label><input className="input" value={receiptConfig.printMode} onChange={(e) => updateReceipt("printMode", e.target.value)} /></div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Diseño de boleta</h2><button className="btn primary" onClick={printReceipt}>Generar boleta impresa</button></div>
          <div className="config-grid">
            <div className="field"><label>Título</label><input className="input" value={receiptConfig.title} onChange={(e) => updateReceipt("title", e.target.value)} /></div>
            <div className="field"><label>Texto impuesto</label><input className="input" value={receiptConfig.taxLabel} onChange={(e) => updateReceipt("taxLabel", e.target.value)} /></div>
            <div className="field" style={{ gridColumn: "1/-1" }}><label>Pie de ticket</label><input className="input" value={receiptConfig.footer} onChange={(e) => updateReceipt("footer", e.target.value)} /></div>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12 }}>
            <label className="toggle"><input type="checkbox" checked={receiptConfig.showWaiter} onChange={(e) => updateReceipt("showWaiter", e.target.checked)} /> Mostrar camarero</label>
            <label className="toggle"><input type="checkbox" checked={receiptConfig.showQr} onChange={(e) => updateReceipt("showQr", e.target.checked)} /> Mostrar QR reseña</label>
          </div>
          <p className="print-preview-note">Formato para impresora térmica {receiptConfig.paperWidth}.</p>
          <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setShowPrinterPanel(!showPrinterPanel)}>
            {showPrinterPanel ? "Ocultar" : "Ver"} configuración de impresora
          </button>
          {showPrinterPanel && (
            <div className="printer-card">
              <b>Impresora configurada</b>
              <p style={{ margin: "6px 0", color: "var(--muted)" }}>{receiptConfig.printer}<br />IP/Estación: {receiptConfig.printerIp}<br />Papel: {receiptConfig.paperWidth}<br />Modo: {receiptConfig.printMode}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="btn primary" onClick={printReceipt}>Imprimir prueba</button>
                <button className="btn ghost" onClick={() => alert("Conexión demo OK")}>Test conexión</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="two">
        <div className="panel print-target">
          <div className="panel-head"><h2>Preview ticket moderno</h2><span className="badge">80mm</span></div>
          <ReceiptPreview receiptConfig={receiptConfig} restaurant={restaurant} />
        </div>
        <div className="panel">
          <h2>Conexiones</h2>
          <div className="demo-banner" style={{ marginBottom: 12 }}>
            <b><span className={`status-dot ${state.demoMode ? "" : "off"}`} />{state.demoMode ? "Demo local activo" : "Modo n8n real"}</b>
            <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>En demo los botones funcionan sin n8n. Desactiva demo para usar URLs reales.</p>
            <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => state.setDemoMode(!state.demoMode)}>
              {state.demoMode ? "Cambiar a n8n real" : "Volver a demo local"}
            </button>
          </div>
          <div className="endpoint-grid">
            {Object.entries(webhooks).map(([key, value]) => (
              <div className="endpoint-row" key={key}>
                <b>{key}</b>
                <input className="input" value={value} onChange={(e) => updateWebhook(key, e.target.value)} />
                <button className="btn primary" onClick={() => simulateWebhook(key)}>Test</button>
              </div>
            ))}
          </div>
          <div className="list" style={{ marginTop: 14 }}>
            <div className="row">
              <span className="badge green">n8n</span>
              <div className="row-main"><b>Webhooks configurables</b><small>Pedidos, llamados, cocina, cobro, reseñas, boleta y caja.</small></div>
              <button className="btn ghost" onClick={() => simulateWebhook("orderCreate")}>Simular pedido</button>
            </div>
            <div className="row">
              <span className="badge blue">QR</span>
              <div className="row-main"><b>Tokens de mesa</b><small>Mapeo token → mesa → zona → sesión.</small></div>
              <button className="btn ghost" onClick={() => simulateWebhook("qrScan")}>Simular scan</button>
            </div>
            <div className="row">
              <span className="badge">Print</span>
              <div className="row-main"><b>{receiptConfig.printer}</b><small>Salida térmica. Demo usa window.print().</small></div>
              <button className="btn ghost" onClick={() => simulateWebhook("receiptPrint")}>Test print</button>
            </div>
          </div>
          <h2 style={{ marginTop: 16 }}>Logs</h2>
          <div className="integration-log">
            {logs.map((l, idx) => (
              <div className="log-row" key={idx}><b>{l.time} · {l.event} · {l.status}</b><br />{l.detail}</div>
            ))}
          </div>
          <h2 style={{ marginTop: 16 }}>Permisos por rol</h2>
          <table className="permission-table">
            <thead><tr><th>Módulo</th><th>Admin</th><th>Camarero</th><th>Cocina</th><th>Caja</th></tr></thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.module}>
                  <td>{p.module}</td>
                  <td className={p.admin ? "permission-ok" : "permission-no"}>{p.admin ? "Sí" : "No"}</td>
                  <td className={p.camarero ? "permission-ok" : "permission-no"}>{p.camarero ? "Sí" : "No"}</td>
                  <td className={p.cocina ? "permission-ok" : "permission-no"}>{p.cocina ? "Sí" : "No"}</td>
                  <td className={p.caja ? "permission-ok" : "permission-no"}>{p.caja ? "Sí" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 style={{ marginTop: 16 }}>Endpoints n8n</h2>
          <pre className="audit">{`POST /webhook/order-create
POST /webhook/camarero-call
POST /webhook/kitchen-call
POST /webhook/bill-request
POST /webhook/receipt-print
POST /webhook/feedback
POST /webhook/cash-close`}</pre>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GastroAdmin({ authStaff, onSignOut }: GastroAdminProps) {
  const initialRole: StaffRole = authStaff?.role === "admin" ? "admin" : "camarero";
  const [role] = useState<StaffRole>(initialRole);
  const [tab, setTab] = useState<TabId>("dashboard");
  const state = useBackofficeState();

  const staffId = useMemo(() => {
    if (!authStaff) return role === "admin" ? "a1" : "w1";
    const match = state.staff.find((s) => s.email === authStaff.email);
    return match?.id ?? (role === "admin" ? "a1" : "w1");
  }, [authStaff, state.staff, role]);

  const camareroOnly: string[] = ["sales", "staff", "inventory", "qr", "menu", "settings"];
  const safeTab: TabId =
    role === "camarero" && camareroOnly.includes(tab) ? "dashboard" : tab;

  const content = useMemo(() => {
    switch (safeTab) {
      case "tables": return <TablesView role={role} staffId={staffId} state={state} />;
      case "orders": return <OrdersView role={role} staffId={staffId} state={state} />;
      case "kitchen": return <KitchenView state={state} />;
      case "calls": return <CallsView role={role} staffId={staffId} state={state} />;
      case "messages": return <MessagesView role={role} staffId={staffId} state={state} />;
      case "sales": return <><CashClosingView state={state} staffId={staffId} /><SalesView /></>;
      case "staff": return <StaffView state={state} />;
      case "inventory": return <InventoryView state={state} />;
      case "qr": return <QRView state={state} />;
      case "menu": return <MenuView state={state} />;
      case "reviews": return <ReviewsView role={role} staffId={staffId} state={state} />;
      case "settings": return <SettingsView state={state} />;
      default: return <Dashboard role={role} staffId={staffId} state={state} />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeTab, role, staffId, state]);

  return (
    <Layout role={role} tab={safeTab} setTab={(t) => setTab(t as TabId)} authStaff={authStaff} onSignOut={onSignOut}>
      <Topbar role={role} authStaff={authStaff} />
      {content}
    </Layout>
  );
}
