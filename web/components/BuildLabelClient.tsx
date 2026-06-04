"use client";

import { useEffect, useState } from "react";
import { isCommitLabel } from "@/lib/is-commit-label";

async function fetchCommitLabel(): Promise<string | null> {
  const bust = `t=${Date.now()}`;
  for (const url of [`/commit-hash.txt?${bust}`, `/api/build-label?${bust}`]) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) continue;
      if (url.includes("commit-hash")) {
        const text = (await r.text()).trim().toLowerCase();
        if (isCommitLabel(text)) return text;
      } else {
        const j = (await r.json()) as { label?: string };
        const next = (j.label ?? "").trim().toLowerCase();
        if (isCommitLabel(next)) return next;
      }
    } catch {
      /* retry */
    }
  }
  return null;
}

export function BuildLabelClient({ fallback }: { fallback?: string }) {
  const initial =
    fallback && isCommitLabel(fallback) ? fallback.toLowerCase() : "…";
  const [label, setLabel] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    const run = async (attempt: number) => {
      const next = await fetchCommitLabel();
      if (cancelled) return;
      if (next) {
        setLabel(next);
        return;
      }
      if (attempt < 4) {
        window.setTimeout(() => void run(attempt + 1), 800 * attempt);
      }
    };
    if (!isCommitLabel(initial)) void run(1);
    return () => {
      cancelled = true;
    };
  }, [initial]);

  return <strong id="aeterna-build-label">{label}</strong>;
}
