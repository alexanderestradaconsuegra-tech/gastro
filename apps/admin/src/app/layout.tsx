import type { Metadata } from "next";
import "./globals.css";

const FAVICON = "https://assets.zyrosite.com/rvH9B7W9kUvvSHwW/chatgpt-image-26-may-2026-16_54_36-4RwvXLTvZr1xrvQL.png";

export const metadata: Metadata = {
  title: "HOLU Admin — Panel de Restaurante",
  description: "Panel de administración HOLU. Gestiona ventas, camareros, cocina, caja, carta y pedidos en tiempo real.",
  robots: "noindex",
  icons: {
    icon: FAVICON,
    apple: FAVICON,
    shortcut: FAVICON,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  const inlineScript = `window.__SB_URL__=${JSON.stringify(supabaseUrl)};window.__SB_KEY__=${JSON.stringify(supabaseKey)};`;

  return (
    <html lang="es">
      <body>
        <script dangerouslySetInnerHTML={{ __html: inlineScript }} />
        {children}
      </body>
    </html>
  );
}
