"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/#apie", label: "Apie iniciatyvą" },
  { href: "/qr-ploksteles", label: "Atminimo plokštelės", highlight: true },
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
      <header className="ch-header ch-header--compact">
        <div className="ch-header__inner">
          <Link href="/" className="ch-logo chronicle-serif" onClick={close}>
            <strong>AETERNA</strong>
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
            <Link href="/wizard" className="ch-header__cta">
              Sukurti atminimo puslapį
            </Link>
            <button
              type="button"
              className="ch-menu-btn"
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
