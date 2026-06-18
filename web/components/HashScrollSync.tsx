"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { syncHashScroll } from "@/lib/app-section-nav";

/** Scroll to `#apie` (and other home anchors) after client navigation. */
export function HashScrollSync() {
  const pathname = usePathname();

  useEffect(() => {
    syncHashScroll(pathname, window.location.hash);
  }, [pathname]);

  useEffect(() => {
    const onHashChange = () => {
      syncHashScroll(window.location.pathname, window.location.hash);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
}
