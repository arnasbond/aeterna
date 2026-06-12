"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/paieska", label: "Ieškoti atminties", highlight: true },
  { href: "/#apie", label: "Apie iniciatyvą" },
  { href: "/wizard", label: "Narystė ir galimybės", highlight: true },
  { href: "/parishes", label: "Parapijos" },
  { href: "/#misios", label: "Šv. Mišių užsakymas" },
  { href: "/#zvakute", label: "Uždegti žvakutę" },
] as const;

const EXAMPLE = "/m/ona-demo";
const EXAMPLE_LABEL = "Kaip atrodo skaitmeninis atminimas";
const EXAMPLE_LABEL_SHORT = "Gyvas pavyzdys";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className="relative z-50 px-4 pt-2">
        <div className="ch-header ch-header--compact ch-header--floating max-w-6xl mx-auto my-4 rounded-full bg-white/70 backdrop-blur-md border border-stone-200/50 px-4 sm:px-6 py-3 shadow-[0_8px_32px_0_rgba(212,175,55,0.05)]">
          <div className="ch-header__inner !max-w-none !p-0 !grid-cols-[auto_1fr_auto]">
            <Link
              href="/"
              className="ch-logo chronicle-serif font-serif shrink-0 text-[#0A1A10]"
              onClick={close}
            >
              <strong className="tracking-[0.28em]">AETERNA</strong>
            </Link>

            <nav className="ch-nav" aria-label="Pagrindinis meniu">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={"highlight" in item && item.highlight ? "ch-nav__plates" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="ch-header__actions">
              <Link href={EXAMPLE} className="ch-header__example" onClick={close} title={EXAMPLE_LABEL}>
                <span className="ch-header__example-long">{EXAMPLE_LABEL}</span>
                <span className="ch-header__example-short">{EXAMPLE_LABEL_SHORT}</span>
              </Link>
              <Link
                href="/wizard"
                className="ch-header__cta !rounded-full !bg-[#0F2519] !border-[#0F2519] hover:!bg-[#0A1A10]"
              >
                Sukurti atminimo puslapį
              </Link>
              <button
                type="button"
                className="ch-menu-btn !rounded-full"
                aria-expanded={open}
                aria-label={open ? "Uždaryti meniu" : "Atidaryti meniu"}
                onClick={() => setOpen((v) => !v)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`ch-mobile-drawer${open ? " ch-mobile-drawer--open" : ""}`} aria-hidden={!open}>
        <div className="ch-mobile-drawer__backdrop" onClick={close} aria-hidden />
        <div className="ch-mobile-drawer__panel">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={"highlight" in item && item.highlight ? "ch-mobile-drawer__plates" : undefined}
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
          <Link href={EXAMPLE} onClick={close}>
            {EXAMPLE_LABEL}
          </Link>
          <Link href="/wizard" className="ch-btn ch-btn--primary ch-btn--block" style={{ marginTop: "1rem" }} onClick={close}>
            Sukurti atminimo puslapį
          </Link>
        </div>
      </div>
    </>
  );
}
