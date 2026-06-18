import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { AppSectionSwipe } from "@/components/AppSectionSwipe";
import { Navigation } from "@/components/Navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DeployBadge } from "@/components/DeployBadge";

export const dynamic = "force-dynamic";
import "./aeterna.css";
import "./chronicle.css";
import "./vk-theme.css";
import "./globals.css";
import "./hercules-theme.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "AETERNA | Virtuali kapavietė su QR kodu ir parama parapijai",
  description:
    "Skaitmeninė atmintis šeimai — QR kodas ant paminklo, memorialinis puslapis, žemėlapis ir parama Jūsų parapijai.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "AETERNA" },
};

export const viewport: Viewport = {
  themeColor: "#141414",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ua = (await headers()).get("user-agent") ?? "";
  const inNativeApp = /AeternaApp\//i.test(ua);

  return (
    <html
      lang="lt"
      className={`${inter.variable} ${cormorant.variable} dark${inNativeApp ? " aeterna-native-app" : ""}`}
    >
      <body className="aeterna-root hercules-root relative min-h-screen antialiased">
        <Script id="aeterna-native-shell" strategy="beforeInteractive">
          {`try{if(/AeternaApp\\//i.test(navigator.userAgent)){document.documentElement.classList.add('aeterna-native-app');}}catch(e){}`}
        </Script>
        <Navigation />
        <AppSectionSwipe />
        <main className="hercules-main">{children}</main>
        {!inNativeApp && <DeployBadge />}
        <SiteFooter />
      </body>
    </html>
  );
}
