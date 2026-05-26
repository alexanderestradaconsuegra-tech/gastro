import type { Metadata } from "next";

const FAVICON = "https://assets.zyrosite.com/rvH9B7W9kUvvSHwW/chatgpt-image-26-may-2026-16_54_36-4RwvXLTvZr1xrvQL.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://holu.app"),
  title: {
    default: "HOLU — Sistema POS para Restaurantes Modernos con IA",
    template: "%s | HOLU",
  },
  description:
    "HOLU es el sistema POS más moderno para restaurantes. Menú digital QR, pedidos en tiempo real, pantalla de cocina, camareros conectados, caja inteligente, propinas e inteligencia artificial integrada. Prueba gratis sin tarjeta.",
  keywords: [
    "sistema POS restaurante",
    "menú digital QR restaurante",
    "pedidos en tiempo real restaurante",
    "software restaurante con IA",
    "sistema restaurante moderno",
    "POS restaurante Chile",
    "cocina digital KDS",
    "camarero app tablet",
    "gestión restaurante nube",
    "autoservicio kiosk restaurante",
    "carta digital QR",
    "sistema de pedidos restaurante",
    "administración restaurante online",
    "HOLU restaurante",
    "restaurante inteligente IA",
  ],
  authors: [{ name: "HOLU" }],
  creator: "HOLU",
  publisher: "HOLU",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "HOLU",
    title: "HOLU — Sistema POS para Restaurantes Modernos con IA",
    description:
      "Mesas QR, pedidos en tiempo real, cocina organizada, camareros conectados, caja inteligente e IA. Todo el restaurante en una sola app. Prueba gratis.",
    images: [
      {
        url: "https://assets.zyrosite.com/rvH9B7W9kUvvSHwW/holu-logo-1-grh8CslJ3uPFxMDR.png",
        width: 1200,
        height: 630,
        alt: "HOLU — Sistema POS para Restaurantes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HOLU — Sistema POS para Restaurantes Modernos con IA",
    description:
      "Mesas QR, pedidos en tiempo real, cocina organizada, camareros conectados, caja e IA. Prueba gratis.",
    images: ["https://assets.zyrosite.com/rvH9B7W9kUvvSHwW/holu-logo-1-grh8CslJ3uPFxMDR.png"],
  },
  icons: {
    icon: FAVICON,
    apple: FAVICON,
    shortcut: FAVICON,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "HOLU",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Sistema POS para restaurantes modernos con menú digital QR, pedidos en tiempo real, pantalla de cocina, gestión de camareros, caja, propinas e inteligencia artificial.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "29",
    highPrice: "99",
    offerCount: "3",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "128",
  },
  featureList: [
    "Menú digital QR por mesa",
    "Pedidos en tiempo real",
    "Pantalla de cocina KDS",
    "Gestión de camareros",
    "Caja y turnos",
    "Propinas digitales",
    "Boletas y reportes",
    "Inteligencia artificial integrada",
    "Autoservicio kiosk",
    "Analítica avanzada",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
