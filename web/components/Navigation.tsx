"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const EXAMPLE = "/m/ona-demo";

/** Mobile horizontal swipe — SaaS pivot links */
const SWIPE_NAV = [
  { href: "/parishes", label: "⛪ Parapijos" },
  { href: "/paieska", label: "📜 Skaitmeniniai metraščiai" },
  { href: "/#parama", label: "💎 Narystės planai" },
  { href: "/qr-ploksteles", label: "📍 Atminimo plokštelės" },
  { href: "/#apie", label: "✨ Mūsų istorija" },
] as const;

const DESKTOP_NAV = [
  { href: "/paieska", label: "Paieška" },
  { href: "/#apie", label: "Apie" },
  { href: "/parishes", label: "Parapijos" },
  { href: "/wizard", label: "Narystė" },
] as const;

const PILL_BASE =
  "snap-center shrink-0 bg-white/60 backdrop-blur-md border border-[#D4AF37]/20 text-stone-900 text-sm font-medium px-4 py-2 rounded-full transition-all active:scale-95 no-underline whitespace-nowrap";
const PILL_ACTIVE = "bg-[#0F2519] text-[#D4AF37] border-[#D4AF37]/40";

function useNavActive() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const isActive = useCallback(
    (href: string) => {
      if (!mounted) return false;
      if (href.startsWith("/#")) {
        const target = href.slice(1);
        return pathname === "/" && hash === target;
      }
      if (href === "/") return pathname === "/";
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [hash, mounted, pathname]
  );

  return { isActive, mounted };
}

function ProfileIconLink() {
  return (
    <Link
      href="/paskyra"
      className="hercules-header__profile flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white/90 transition-colors hover:border-white/35 hover:bg-white/12"
      aria-label="Mano paskyra"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}

export function Navigation() {
  const { isActive } = useNavActive();

  return (
    <>
      <header className="hercules-header hercules-header--stacked">
        <div className="flex w-full items-center justify-between px-4 py-3 md:min-w-0 md:flex-1 md:px-0 md:py-0">
          <Link href="/" className="hercules-header__logo shrink-0">
            AETERNA
          </Link>

          <nav className="hercules-header__nav" aria-label="Pagrindinis meniu">
            {DESKTOP_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hercules-header__link${isActive(item.href) ? " hercules-header__link--active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
            <Link href={EXAMPLE} className="hercules-header__link">
              Pavyzdys
            </Link>
            <Link href="/wizard" className="hercules-header__cta">
              Pradėti
            </Link>
          </nav>

          <div className="hercules-header__actions shrink-0">
            <ProfileIconLink />
          </div>
        </div>

        <div className="hercules-header__swipe-wrap md:hidden">
          <nav
            className="hercules-header__swipe flex w-full min-w-0 max-w-full flex-nowrap overflow-x-auto snap-x snap-mandatory gap-3 px-4 py-2 scrollbar-hide [-webkit-overflow-scrolling:touch]"
            aria-label="Greita navigacija"
          >
            {SWIPE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hercules-nav-pill ${PILL_BASE}${isActive(item.href) ? ` hercules-nav-pill--active ${PILL_ACTIVE}` : ""}`}
                aria-current={isActive(item.href) ? "page" : undefined}
                draggable={false}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="hercules-header-spacer" aria-hidden />
    </>
  );
}

/** @deprecated Use `Navigation` — kept for existing imports */
export const SiteHeader = Navigation;
