import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const FAVICON = "https://assets.zyrosite.com/rvH9B7W9kUvvSHwW/chatgpt-image-26-may-2026-16_54_36-4RwvXLTvZr1xrvQL.png";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HOLU — Tu mesa",
  description: "Menú digital, pedidos y más desde tu mesa con HOLU.",
  robots: "noindex",
  icons: {
    icon: FAVICON,
    apple: FAVICON,
    shortcut: FAVICON,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
