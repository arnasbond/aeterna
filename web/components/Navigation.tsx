"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { APP_SECTIONS, getSectionTitle, resolveSectionIndex } from "@/lib/app-section-nav";
import { SectionNavLink } from "@/components/SectionNavLink";

const EXAMPLE = "/m/ona-demo";

type MobileMenuItem = {
  href: string;
  label: string;
  nested?: boolean;
};

type MobileMenuGroup = {
  title: string;
  items: MobileMenuItem[];
};

const MOBILE_MENU_GROUPS: MobileMenuGroup[] = [
  {
    title: "Sekcijos",
    items: APP_SECTIONS.map((section) => ({ href: section.href, label: section.title })),
  },
  {
    title: "Prisijungimas ir registracija",
    items: [
      { href: "/prisijungti?tab=login", label: "Prisijungti", nested: true },
      { href: "/prisijungti?tab=register", label: "Registruotis", nested: true },
      { href: "/priest/login", label: "Parapijos administratoriui", nested: true },
      { href: "/admin/login", label: "Administratoriui", nested: true },
    ],
  },
  {
    title: "Paskyra",
    items: [
      { href: "/paskyra", label: "Mano paskyra" },
      { href: "/wizard", label: "Sukurti memorialą" },
      { href: EXAMPLE, label: "Pavyzdinis metraštis" },
    ],
  },
  {
    title: "Kita",
    items: [
      { href: "/map", label: "Žemėlapis" },
      { href: "/atsisiusti", label: "Android programėlė" },
    ],
  },
];

const DESKTOP_NAV = [
  { href: "/paieska", label: "Paieška" },
  { href: "/#apie", label: "Apie" },
  { href: "/parishes", label: "Parapijos" },
  { href: "/wizard", label: "Narystė" },
] as const;

function matchesMenuHref(href: string, pathname: string, hash: string, search: string): boolean {
  if (href.startsWith("/#")) {
    const target = href.slice(1);
    return pathname === "/" && hash === target;
  }

  const [path, queryPart] = href.split("?");
  const pathMatches = pathname === path || pathname.startsWith(`${path}/`);
  if (!pathMatches) return false;
  if (!queryPart) return true;

  const hrefParams = new URLSearchParams(queryPart);
  const currentParams = new URLSearchParams(search.replace(/^\?/, ""));

  for (const [key, value] of hrefParams) {
    const current = currentParams.get(key);
    if (key === "tab" && path === "/prisijungti" && value === "login") {
      if (current === null || current === "login") return true;
      return false;
    }
    if (current !== value) return false;
  }

  return true;
}

function useNavActive() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const syncLocation = () => {
      setHash(window.location.hash);
      setSearch(window.location.search);
    };
    syncLocation();
    window.addEventListener("hashchange", syncLocation);
    window.addEventListener("popstate", syncLocation);
    return () => {
      window.removeEventListener("hashchange", syncLocation);
      window.removeEventListener("popstate", syncLocation);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setHash(window.location.hash);
    setSearch(window.location.search);
  }, [mounted, pathname]);

  const isActive = useCallback(
    (href: string) => {
      if (!mounted) return false;
      if (href === "/") return pathname === "/";
      return matchesMenuHref(href, pathname, hash, search);
    },
    [hash, mounted, pathname, search]
  );

  const sectionTitle = mounted ? getSectionTitle(pathname, hash) : null;
  const sectionIndex = mounted ? resolveSectionIndex(pathname, hash) : -1;

  return { isActive, sectionTitle, sectionIndex };
}

function MobileNavDrawer({
  panelId,
  open,
  onClose,
  isActive,
}: {
  panelId: string;
  open: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  return (
    <div
      id={panelId}
      className={`ch-mobile-drawer md:hidden${open ? " ch-mobile-drawer--open" : ""}`}
      data-no-section-swipe
      aria-hidden={!open}
    >
      <button
        type="button"
        className="ch-mobile-drawer__backdrop"
        aria-label="Uždaryti meniu"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <div className="ch-mobile-drawer__panel ch-mobile-drawer__panel--dark hercules-mobile-drawer__panel">
        <div className="hercules-mobile-drawer__head">
          <p className="hercules-mobile-drawer__title">Meniu</p>
          <button
            type="button"
            className="hercules-mobile-drawer__close"
            aria-label="Uždaryti meniu"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <nav className="hercules-mobile-drawer__nav" aria-label="Mobilus meniu">
          {MOBILE_MENU_GROUPS.map((group) => (
            <div key={group.title} className="hercules-mobile-drawer__group">
              <p className="hercules-mobile-drawer__group-title">{group.title}</p>
              {group.items.map((item) => (
                <SectionNavLink
                  key={item.href}
                  href={item.href}
                  className={`hercules-mobile-drawer__link${item.nested ? " hercules-mobile-drawer__link--nested" : ""}${isActive(item.href) ? " hercules-mobile-drawer__link--active" : ""}`}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={onClose}
                >
                  {item.label}
                </SectionNavLink>
              ))}
            </div>
          ))}
        </nav>

        <Link href="/wizard" className="hercules-mobile-drawer__cta" onClick={onClose}>
          Pradėti
        </Link>
      </div>
    </div>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const isMemorialPage = pathname.startsWith("/m/");
  const { isActive, sectionTitle, sectionIndex } = useNavActive();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [closeMenu, sectionTitle]);

  return (
    <>
      <header
        className={`hercules-header hercules-header--stacked${isMemorialPage ? " hercules-header--memorial-ivory" : ""}`}
      >
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
            {DESKTOP_NAV.map((item) =>
              item.href.startsWith("/#") ? (
                <SectionNavLink
                  key={item.href}
                  href={item.href}
                  className={`hercules-header__link${isActive(item.href) ? " hercules-header__link--active" : ""}`}
                >
                  {item.label}
                </SectionNavLink>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hercules-header__link${isActive(item.href) ? " hercules-header__link--active" : ""}`}
                >
                  {item.label}
                </Link>
              )
            )}
            <Link href={EXAMPLE} className="hercules-header__link">
              Pavyzdys
            </Link>
            <Link href="/wizard" className="hercules-header__cta">
              Pradėti
            </Link>
          </nav>

          <div className="hercules-header__actions shrink-0">
            <Link
              href="/paskyra"
              className={`hercules-header__profile flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                isMemorialPage
                  ? "border-[#D4AF37]/25 bg-white/50 text-[#1e3a1e] hover:border-[#D4AF37]/45 hover:bg-white/70"
                  : "border-white/20 bg-white/8 text-white/90 hover:border-white/35 hover:bg-white/12"
              }`}
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
            <button
              type="button"
              className="hercules-header__menu"
              aria-label={menuOpen ? "Uždaryti meniu" : "Atidaryti meniu"}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <MobileNavDrawer panelId={menuId} open={menuOpen} onClose={closeMenu} isActive={isActive} />

      <div className="hercules-header-spacer" aria-hidden />
    </>
  );
}

/** @deprecated Use `Navigation` — kept for existing imports */
export const SiteHeader = Navigation;
