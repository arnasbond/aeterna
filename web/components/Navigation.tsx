"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { APP_SECTIONS, getSectionTitle, resolveSectionIndex } from "@/lib/app-section-nav";

const EXAMPLE = "/m/ona-demo";

const DESKTOP_NAV = [
  { href: "/paieska", label: "Paieška" },
  { href: "/#apie", label: "Apie" },
  { href: "/parishes", label: "Parapijos" },
  { href: "/wizard", label: "Narystė" },
] as const;

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

  const sectionTitle = mounted ? getSectionTitle(pathname, hash) : null;
  const sectionIndex = mounted ? resolveSectionIndex(pathname, hash) : -1;

  return { isActive, sectionTitle, sectionIndex };
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
  const { isActive, sectionTitle, sectionIndex } = useNavActive();

  return (
    <>
      <header className="hercules-header hercules-header--stacked">
        <div className="flex w-full items-start justify-between gap-3 px-4 py-3 md:min-w-0 md:flex-1 md:items-center md:gap-0 md:px-0 md:py-0">
          <div className="hercules-header__brand min-w-0">
            <Link href="/" className="hercules-header__logo block shrink-0">
              AETERNA
            </Link>
            {sectionTitle ? (
              <p className="hercules-header__section md:hidden" aria-live="polite">
                {sectionTitle}
              </p>
            ) : null}
          </div>

          {sectionIndex >= 0 ? (
            <div className="hercules-header__dots md:hidden" aria-hidden>
              {APP_SECTIONS.map((section, index) => (
                <span
                  key={section.href}
                  className={`hercules-header__dot${index === sectionIndex ? " hercules-header__dot--active" : ""}`}
                />
              ))}
            </div>
          ) : null}

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
      </header>

      <div className="hercules-header-spacer" aria-hidden />
    </>
  );
}

/** @deprecated Use `Navigation` — kept for existing imports */
export const SiteHeader = Navigation;
