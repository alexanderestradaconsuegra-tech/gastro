import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gastro Admin",
  description: "Sistema de administración de restaurante",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Prefer NEXT_PUBLIC_ (build-time baked) then fall back to bare names (runtime-only in EasyPanel)
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
        {/* Inject Supabase config at runtime so the client bundle can use it even when
            NEXT_PUBLIC_* vars were not available at Docker build time */}
        <script dangerouslySetInnerHTML={{ __html: inlineScript }} />
        {children}
      </body>
    </html>
  );
}
