import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AeternaNav } from "@/components/AeternaNav";
import "./globals.css";
import "./aeterna.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "AETERNA | Skaitmeninis atminimas ir parama parapijai",
  description: "Skaitmeninis atminimo puslapis per QR kodą ant paminklo. Parama Jūsų parapijai.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "AETERNA" },
};

export const viewport: Viewport = {
  themeColor: "#fcfbf7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt" className={`${inter.variable} ${playfair.variable}`}>
      <body className="aeterna-root">
        <AeternaNav />
        {children}
        <footer className="ae-footer">
          <p>AETERNA — skaitmeninis atminimas ir parama parapijai</p>
          <nav className="ae-footer-links" aria-label="Paslaugos ir prisijungimai">
            <a href="/m/ona-demo">Demo profilis</a>
            <span aria-hidden>·</span>
            <a href="/priest/login">Klebono prisijungimas</a>
            <span aria-hidden>·</span>
            <a href="/admin/login" className="ae-footer-links__admin">
              Administratoriaus skydelis
            </a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
