/** Global SaaS sections — swipe left/right anywhere on mobile switches between these */
export const APP_SECTIONS = [
  { href: "/parishes", title: "Parapijos" },
  { href: "/paieska", title: "Skaitmeniniai metraščiai" },
  { href: "/wizard", title: "Narystės planai" },
  { href: "/qr-ploksteles", title: "Atminimo plokštelės" },
  { href: "/#apie", title: "Mūsų istorija" },
] as const;

export type AppSection = (typeof APP_SECTIONS)[number];

type SectionRouter = { push: (href: string) => void };

export function resolveSectionIndex(pathname: string, hash: string): number {
  if (pathname === "/parishes" || pathname.startsWith("/parishes/")) return 0;
  if (pathname === "/paieska") return 1;
  if (pathname === "/wizard") return 2;
  if (pathname === "/qr-ploksteles") return 3;
  if (pathname === "/" && hash === "#apie") return 4;
  return -1;
}

export function getSectionTitle(pathname: string, hash: string): string | null {
  const index = resolveSectionIndex(pathname, hash);
  return index >= 0 ? APP_SECTIONS[index].title : null;
}

export function isAppSectionRoute(pathname: string, hash: string): boolean {
  return resolveSectionIndex(pathname, hash) >= 0;
}

export function sectionHrefByDelta(pathname: string, hash: string, delta: number): string {
  const len = APP_SECTIONS.length;
  let index = resolveSectionIndex(pathname, hash);
  if (index < 0) {
    index = delta > 0 ? -1 : len;
  }
  const next = (((index + delta) % len) + len) % len;
  return APP_SECTIONS[next].href;
}

export function scrollToSectionId(id: string, behavior: ScrollBehavior = "smooth"): boolean {
  if (typeof document === "undefined") return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: "start" });
  return true;
}

/** Navigate to a section href — handles home-page hash anchors reliably in App Router. */
export function navigateToSectionHref(href: string, router: SectionRouter): void {
  if (href.startsWith("/#")) {
    const hash = href.slice(1);
    const id = hash.slice(1);

    if (window.location.pathname === "/") {
      if (window.location.hash !== hash) {
        window.history.pushState(null, "", href);
        window.dispatchEvent(new Event("hashchange"));
      }
      window.requestAnimationFrame(() => {
        scrollToSectionId(id);
      });
      return;
    }

    router.push(href);
    return;
  }

  router.push(href);
}

export function syncHashScroll(pathname: string, hash: string): void {
  if (pathname !== "/" || !hash) return;
  const id = hash.slice(1);
  window.requestAnimationFrame(() => {
    window.setTimeout(() => scrollToSectionId(id, "auto"), 80);
  });
}
