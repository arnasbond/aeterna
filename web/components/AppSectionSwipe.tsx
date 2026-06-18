"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { sectionHrefByDelta } from "@/lib/app-section-nav";

const SWIPE_MIN_PX = 64;
const SWIPE_RATIO = 1.2;

function gestureNavEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 767px)").matches ||
    document.documentElement.classList.contains("aeterna-native-app")
  );
}

function shouldIgnoreTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return true;

  if (target.closest("[data-no-section-swipe], dialog, [role='dialog'], [data-radix-portal]")) {
    return true;
  }

  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON") {
    return true;
  }

  let el: Element | null = target;
  while (el && el !== document.body) {
    const style = window.getComputedStyle(el);
    const scrollableX =
      (style.overflowX === "auto" || style.overflowX === "scroll") &&
      el.scrollWidth > el.clientWidth + 4;
    if (scrollableX) return true;
    el = el.parentElement;
  }

  return false;
}

/** Mobile: swipe left/right anywhere to switch main app sections */
export function AppSectionSwipe() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const hashRef = useRef("");

  useEffect(() => {
    pathnameRef.current = pathname;
    hashRef.current = window.location.hash;
  }, [pathname]);

  useEffect(() => {
    const syncHash = () => {
      hashRef.current = window.location.hash;
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const startRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      if (!gestureNavEnabled()) return;
      if (event.touches.length !== 1) return;
      if (shouldIgnoreTarget(event.target)) return;

      startRef.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        active: true,
      };
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!gestureNavEnabled()) return;
      if (!startRef.current.active) return;
      startRef.current.active = false;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - startRef.current.x;
      const dy = touch.clientY - startRef.current.y;

      if (Math.abs(dx) < SWIPE_MIN_PX) return;
      if (Math.abs(dx) < Math.abs(dy) * SWIPE_RATIO) return;

      const delta = dx < 0 ? 1 : -1;
      const href = sectionHrefByDelta(pathnameRef.current, hashRef.current, delta);
      router.push(href);
    };

    const onTouchCancel = () => {
      startRef.current.active = false;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [router]);

  return null;
}
