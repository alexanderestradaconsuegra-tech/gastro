import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gastro Admin",
  description: "Sistema de administración de restaurante",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
