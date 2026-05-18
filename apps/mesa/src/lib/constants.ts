export const RESTAURANT_ID = "nido";
export const RESTAURANT_NAME = "Nido";

// Fallback QR→table mapping when Supabase is unavailable
export const QR_TABLES: Record<string, { tableId: number; tableLabel: string; zone: string }> = {
  A7K92: { tableId: 7, tableLabel: "Mesa 7", zone: "Salón" },
  B3M15: { tableId: 3, tableLabel: "Mesa 3", zone: "Terraza" },
  C9P44: { tableId: 9, tableLabel: "Mesa 9", zone: "Interior" },
  D2R88: { tableId: 2, tableLabel: "Mesa 2", zone: "Salón" },
  E5T21: { tableId: 5, tableLabel: "Mesa 5", zone: "Terraza" },
};

export interface MenuItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: string;
  price: number;
  avgPrepMinutes: number;
  kcal: number;
  tags: string[];
  allergens: string[];
  winePair?: string;
  imageUrl?: string;
  stockStatus: "available" | "low" | "out";
}

export const CATEGORIES = [
  "Todo",
  "Entrantes",
  "Pasta",
  "Pescado",
  "Carne",
  "Postres",
  "Bebidas",
] as const;

export const MENU: MenuItem[] = [
  {
    id: "burrata",
    name: "Burrata della Casa",
    subtitle: "Tomate heritage · Pesto genovés",
    description: "Burrata cremosa sobre cama de tomates heritage de temporada con pesto artesanal y aceite de albahaca.",
    category: "Entrantes",
    price: 16500,
    avgPrepMinutes: 8,
    kcal: 380,
    tags: ["vegetariano", "sin gluten"],
    allergens: ["lácteos"],
    imageUrl: "",
    stockStatus: "available",
  },
  {
    id: "carpaccio",
    name: "Carpaccio di Manzo",
    subtitle: "Rúcula · Parmesano · Alcaparras",
    description: "Finas láminas de solomillo de ternera con rúcula silvestre, virutas de parmesano y alcaparras de Pantelleria.",
    category: "Entrantes",
    price: 18500,
    avgPrepMinutes: 10,
    kcal: 290,
    tags: ["sin gluten"],
    allergens: ["lácteos", "mostaza"],
    stockStatus: "available",
  },
  {
    id: "arancini",
    name: "Arancini al Tartufo",
    subtitle: "Risotto · Mozzarella · Trufa negra",
    description: "Croquetas de risotto rellenas de mozzarella fundida con aceite de trufa negra y parmesano.",
    category: "Entrantes",
    price: 14500,
    avgPrepMinutes: 12,
    kcal: 420,
    tags: ["vegetariano"],
    allergens: ["gluten", "lácteos", "huevo"],
    stockStatus: "available",
  },
  {
    id: "tagliatelle",
    name: "Tagliatelle al Ragù",
    subtitle: "Ragù lento · Parmesano · Albahaca",
    description: "Pasta fresca al huevo con ragù de ternera y cerdo cocido 6 horas, parmesano reggiano y albahaca fresca.",
    category: "Pasta",
    price: 21500,
    avgPrepMinutes: 15,
    kcal: 680,
    tags: ["bestseller"],
    allergens: ["gluten", "lácteos", "huevo"],
    stockStatus: "available",
    winePair: "Barolo DOCG 2019",
  },
  {
    id: "risotto",
    name: "Risotto ai Funghi Porcini",
    subtitle: "Porcini · Parmesano · Mantequilla",
    description: "Risotto Carnaroli con porcini frescos y secos, mantequilla de cultivo y parmesano envejecido 36 meses.",
    category: "Pasta",
    price: 22000,
    avgPrepMinutes: 20,
    kcal: 590,
    tags: ["vegetariano"],
    allergens: ["lácteos"],
    stockStatus: "available",
    winePair: "Brunello di Montalcino 2018",
  },
  {
    id: "branzino",
    name: "Branzino al Forno",
    subtitle: "Hinojo · Limón · Aceite de oliva",
    description: "Lubina del Mediterráneo al horno con hinojo asado, limón confitado y aceite de oliva virgen extra.",
    category: "Pescado",
    price: 28500,
    avgPrepMinutes: 22,
    kcal: 420,
    tags: ["sin gluten", "ligero"],
    allergens: ["pescado"],
    stockStatus: "available",
    winePair: "Vermentino Sardegna 2023",
  },
  {
    id: "ossobuco",
    name: "Ossobuco alla Milanese",
    subtitle: "Gremolata · Risotto amarillo",
    description: "Jarrete de ternera estofado durante 3 horas con gremolata de limón y perejil. Servido con risotto alla milanese.",
    category: "Carne",
    price: 34000,
    avgPrepMinutes: 25,
    kcal: 780,
    tags: ["especialidad"],
    allergens: ["gluten", "lácteos"],
    stockStatus: "available",
    winePair: "Amarone della Valpolicella 2017",
  },
  {
    id: "tiramisu",
    name: "Tiramisù della Nonna",
    subtitle: "Mascarpone · Café espresso · Cacao",
    description: "Receta tradicional con mascarpone artesanal, savoiardi empapados en espresso y cacao Valrhona.",
    category: "Postres",
    price: 10500,
    avgPrepMinutes: 5,
    kcal: 480,
    tags: ["clásico"],
    allergens: ["gluten", "lácteos", "huevo"],
    stockStatus: "available",
  },
  {
    id: "panna",
    name: "Panna Cotta ai Frutti di Bosco",
    subtitle: "Coulis de frutos rojos",
    description: "Panna cotta de vainilla de Madagascar con coulis de frutos del bosque frescos y menta.",
    category: "Postres",
    price: 9500,
    avgPrepMinutes: 5,
    kcal: 320,
    tags: ["sin gluten", "vegetariano"],
    allergens: ["lácteos"],
    stockStatus: "available",
  },
  {
    id: "spritz",
    name: "Aperol Spritz",
    subtitle: "Aperol · Prosecco · Soda · Naranja",
    description: "El clásico aperitivo italiano con Aperol, Prosecco DOC, soda y rodaja de naranja.",
    category: "Bebidas",
    price: 10000,
    avgPrepMinutes: 3,
    kcal: 190,
    tags: ["aperitivo"],
    allergens: ["sulfitos"],
    stockStatus: "available",
  },
  {
    id: "vino",
    name: "Copa de Vino de la Casa",
    subtitle: "Blanco · Rosado · Tinto",
    description: "Selección del sommelier. Pregunte por las opciones del día.",
    category: "Bebidas",
    price: 8500,
    avgPrepMinutes: 2,
    kcal: 120,
    tags: [],
    allergens: ["sulfitos"],
    stockStatus: "available",
  },
  {
    id: "agua",
    name: "Acqua Minerale",
    subtitle: "Natural o con gas · 75cl",
    description: "Agua mineral italiana Lurisia, natural o con gas.",
    category: "Bebidas",
    price: 4500,
    avgPrepMinutes: 1,
    kcal: 0,
    tags: ["sin gluten", "sin alcohol"],
    allergens: [],
    stockStatus: "available",
  },
];

export const PROMOS = [
  { id: "1", title: "Menú Degustación", desc: "6 platos + maridaje · 65€", badge: "Popular" },
  { id: "2", title: "Happy Hour", desc: "Cócteles 2x1 · 18:00–20:00", badge: "Hoy" },
];

export const KITCHEN_STEPS = [
  { key: "received", label: "Recibido", icon: "✓" },
  { key: "prep", label: "En cocina", icon: "🍳" },
  { key: "plating", label: "Emplatando", icon: "🍽️" },
  { key: "served", label: "En camino", icon: "🚀" },
] as const;

export type KitchenStatus = (typeof KITCHEN_STEPS)[number]["key"];

export const WAITER_REASONS = [
  "Más agua",
  "Más pan",
  "Cubiertos adicionales",
  "Consulta sobre el menú",
  "Alergia / intolerancia",
  "Otro",
] as const;

export const AI_QUICK_QUESTIONS = [
  "¿Qué lleva el Ossobuco?",
  "¿Hay opciones sin gluten?",
  "Llama al camarero",
  "¿Cuánto tarda la pasta?",
  "¿Qué vino recomiendas?",
  "Quiero pagar",
];

// money(21500) → "21,50 €"
export function money(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

export function statusIndex(status: KitchenStatus): number {
  return KITCHEN_STEPS.findIndex((s) => s.key === status);
}
