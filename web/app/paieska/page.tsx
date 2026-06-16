import type { Metadata } from "next";
import Link from "next/link";
import { MemorialSearchBox } from "@/components/home/MemorialSearchBox";
import { HerculesPageShell } from "@/components/layout/HerculesPageShell";

export const metadata: Metadata = {
  title: "Ieškoti atminties | AETERNA",
  description: "Raskite memorialinį puslapį pagal vardą.",
};

export default function PaieskaPage() {
  return (
    <HerculesPageShell
      eyebrow="Memorialų paieška"
      title="Ieškoti atminties"
      lead="Įveskite vardą ar pavardę — pvz. raidę „V“ arba „Stasė“."
      center
      narrow
      panel
    >
      <MemorialSearchBox variant="hercules" />
      <p className="hercules-page__back">
        <Link href="/" className="ae-btn ae-btn--outline">
          ← Titulinis puslapis
        </Link>
      </p>
    </HerculesPageShell>
  );
}
