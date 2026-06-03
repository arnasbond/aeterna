"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/parishes", label: "Parapijos" },
  { href: "/#misios", label: "Šv. Mišių užsakymas" },
  { href: "/#zvakute", label: "Uždegti žvakutę" },
] as const;

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
      <header className="ch-header">
        <div className="ch-header__inner">
          <Link href="/" className="ch-logo" onClick={close}>
            <strong>AETERNA</strong>
          </Link>

          <nav className="ch-nav" aria-label="Pagrindinis meniu">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
            <Link key={item.href} href={item.href} onClick={close}>
              {item.label}
            </Link>
          ))}
          <Link href="/wizard" className="ch-btn ch-btn--primary ch-btn--block" style={{ marginTop: "1rem" }} onClick={close}>
            Sukurti atminimo puslapį
          </Link>
        </div>
      </div>
    </>
  );
}
