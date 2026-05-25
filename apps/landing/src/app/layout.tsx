import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VYKO — Sistema inteligente para restaurantes",
  description: "Pedidos en tiempo real, mesas QR, cocina organizada, camareros conectados y administración completa en una sola plataforma.",
  openGraph: {
    title: "VYKO — Sistema inteligente para restaurantes",
    description: "Todo el restaurante conectado en tiempo real.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
