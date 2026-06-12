import type { Metadata } from "next";
import Link from "next/link";
import { MemorialSearchBox } from "@/components/home/MemorialSearchBox";

export const metadata: Metadata = {
  title: "Ieškoti atminties | AETERNA",
  description: "Raskite memorialinį puslapį pagal vardą.",
};

export default function PaieskaPage() {
  return (
    <section className="relative px-6 py-16 text-center lg:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#0F2519]/75 sm:text-sm">
          Memorialų paieška
        </p>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-900 lg:text-5xl">
          Ieškoti atminties
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#0A1A10]/75">
          Įveskite vardą ar pavardę — pvz. raidę „V“ arba „Stasė“.
        </p>
        <div className="mt-10">
          <MemorialSearchBox />
        </div>
        <p className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-[#D4AF37]/40 px-5 py-2.5 text-sm font-semibold text-[#0A1A10] transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
          >
            ← Titulinis puslapis
          </Link>
        </p>
      </div>
    </section>
  );
}
