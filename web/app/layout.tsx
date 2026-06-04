import type { Metadata, Viewport } from "next";
import { Dancing_Script, Inter, Playfair_Display } from "next/font/google";
import { Navigation } from "@/components/Navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BuildLabelBoot } from "@/components/BuildLabelBoot";
import { DeployBadge } from "@/components/DeployBadge";
import "./globals.css";
import "./aeterna.css";
import "./chronicle.css";
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
  themeColor: "#1E3A1E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}>
      <body className="aeterna-root">
        <Navigation />
        <main>{children}</main>
        <DeployBadge />
        <BuildLabelBoot />
        <SiteFooter />
      </body>
    </html>
  );
}
