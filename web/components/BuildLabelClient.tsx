"use client";

import { useEffect, useState } from "react";
import { isCommitLabel } from "@/lib/is-commit-label";

/** Visada iš /api/build-label — ne iš serverio HTML (vengia deployment ID). */
export function BuildLabelClient() {
  const [label, setLabel] = useState("…");

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch("/api/build-label", { cache: "no-store" })
        .then((r) => r.json())
        .then((j: { label?: string }) => {
          if (cancelled) return;
          const next = (j.label ?? "").trim().toLowerCase();
          if (isCommitLabel(next)) setLabel(next);
        })
        .catch(() => {});
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return <strong id="aeterna-build-label">{label}</strong>;
}
