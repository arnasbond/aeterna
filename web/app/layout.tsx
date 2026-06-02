import type { Metadata, Viewport } from "next";
import { Dancing_Script, Inter, Playfair_Display } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";
import "./aeterna.css";
import "./vk-theme.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const dancing = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing" });

export const metadata: Metadata = {
  title: "AETERNA | Virtuali kapavietė su QR kodu ir parama parapijai",
  description:
    "Skaitmeninė atmintis šeimai — QR kodas ant paminklo, memorialinis puslapis, žemėlapis ir parama Jūsų parapijai.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "AETERNA" },
};

export const viewport: Viewport = {
  themeColor: "#4a2f7a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}>
      <body className="aeterna-root">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
