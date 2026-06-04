import type { Metadata } from "next";
import Link from "next/link";
import { MemorialSearchBox } from "@/components/home/MemorialSearchBox";

export const metadata: Metadata = {
  title: "Ieškoti atminties | AETERNA",
  description: "Raskite memorialinį puslapį pagal vardą.",
};

export default function PaieskaPage() {
  return (
    <section className="ae-section ae-section--white" style={{ paddingTop: "2rem" }}>
      <h1 className="ae-section-title">Ieškoti atminties</h1>
      <p className="ae-section-lead" style={{ textAlign: "center", maxWidth: "28rem", margin: "0 auto 1.5rem" }}>
        Įveskite vardą ar pavardę — pvz. raidę „V“ arba „Stasė“.
      </p>
      <div style={{ maxWidth: "32rem", margin: "0 auto" }}>
        <MemorialSearchBox />
      </div>
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link href="/" className="ae-btn ae-btn--outline">
          ← Titulinis puslapis
        </Link>
      </p>
    </section>
  );
}
