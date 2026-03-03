import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "BerzosaNeuro — Neurociencia Aplicada",
  description:
    "Especialista en neurociencia aplicada al bienestar, el rendimiento y la transformación personal. Un enfoque riguroso, diferente y profundamente humano.",
  openGraph: {
    title: "BerzosaNeuro — Neurociencia Aplicada",
    description:
      "Especialista en neurociencia aplicada al bienestar, el rendimiento y la transformación personal.",
    url: "https://webberzosaneuro.vercel.app",
    siteName: "BerzosaNeuro",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-[#080808] text-[#f0ede8]">{children}</body>
    </html>
  );
}
