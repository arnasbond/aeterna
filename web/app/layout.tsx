import type { Metadata, Viewport } from "next";
import { Dancing_Script, Inter, Playfair_Display } from "next/font/google";
import { Navigation } from "@/components/Navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DeployBadge } from "@/components/DeployBadge";

export const dynamic = "force-dynamic";
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
  themeColor: "#0F2519",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}>
      <body className="aeterna-root relative min-h-screen bg-[#FCFBF7] text-[#0A1A10] antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-[120px]" />
          <div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-amber-500/5 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-500/5 blur-[120px]" />
        </div>
        <Navigation />
        <main>{children}</main>
        <DeployBadge />
        <SiteFooter />
      </body>
    </html>
  );
}
