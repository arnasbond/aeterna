"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Pagrindinis" },
  { href: "/#kaip-veikia", label: "Kaip veikia" },
  { href: "/m/ona-demo", label: "Demo kapavietė" },
  { href: "/qr-ploksteles", label: "QR plokštelės" },
  { href: "/map", label: "Žemėlapis" },
  { href: "/parishes", label: "Parapijos" },
  { href: "/#zvakute", label: "Žvakutė" },
  { href: "/prisijungti", label: "Prisijungti" },
  { href: "/priest/login", label: "Parapijos administratorius" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const goHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined" && window.AeternaApp?.goHome) {
      e.preventDefault();
      window.AeternaApp.goHome();
      setOpen(false);
    }
  };

  const close = () => setOpen(false);

  return (
    <>
      <header className="vk-header">
        <div className="vk-header__inner">
          <Link href="/" className="vk-logo" onClick={goHome}>
            <span className="vk-logo__mark" aria-hidden>
              ✝
            </span>
            <span className="vk-logo__text">
              <strong>AETERNA</strong>
              <small>Skaitmeninė atmintis</small>
            </span>
          </Link>

          <nav className="vk-nav-desktop" aria-label="Pagrindinis meniu">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="vk-header__actions">
            <Link href="/paskyra" className="vk-btn vk-btn--outline vk-header__account">
              Paskyra
            </Link>
            <Link href="/wizard" className="vk-btn vk-btn--primary vk-header__cta">
              Sukurti atmintį
              <span aria-hidden>→</span>
            </Link>
            <button
              type="button"
              className="vk-menu-toggle"
              aria-expanded={open}
              aria-controls="vk-mobile-menu"
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

      <div
        id="vk-mobile-menu"
        className={`vk-mobile-menu${open ? " vk-mobile-menu--open" : ""}`}
        aria-hidden={!open}
      >
        <div className="vk-mobile-menu__backdrop" onClick={close} aria-hidden />
        <div className="vk-mobile-menu__panel">
          <div className="vk-mobile-menu__head">
            <span className="vk-logo__mark" aria-hidden>
              ✝
            </span>
            <strong>AETERNA</strong>
            <button type="button" className="vk-mobile-menu__close" onClick={close} aria-label="Uždaryti">
              ×
            </button>
          </div>
          <nav className="vk-mobile-menu__nav">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} onClick={close}>
                {item.label}
              </Link>
            ))}
            <Link href="/paskyra" onClick={close}>
              Mano paskyra
            </Link>
            <Link href="/atsisiusti" onClick={close}>
              Atsisiųsti programėlę
            </Link>
            <Link href="/admin/login" className="vk-mobile-menu__admin" onClick={close}>
              Administratorius
            </Link>
          </nav>
          <Link href="/wizard" className="vk-btn vk-btn--primary vk-btn--block" onClick={close}>
            Sukurti atmintį →
          </Link>
        </div>
      </div>
    </>
  );
}
