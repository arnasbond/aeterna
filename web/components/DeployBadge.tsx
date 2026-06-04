"use client";

import { useEffect, useState } from "react";

function isDevHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h.includes("localhost") ||
    h.startsWith("127.0.0.1") ||
    h.startsWith("192.168.") ||
    h.startsWith("10.") ||
    h.includes("10.0.2.2") ||
    (h.includes(":3000") && !h.includes("vercel.app"))
  );
}

type Props = { initialLabel?: string };

/** Versija + host (local = dev PC, raidės/skaičiai = Vercel commit). */
export function DeployBadge({ initialLabel }: Props) {
  const safeInitial =
    initialLabel && initialLabel !== "vercel" && initialLabel !== "local"
      ? initialLabel
      : "…";
  const [label, setLabel] = useState<string>(safeInitial);
  const [host, setHost] = useState("");

  useEffect(() => {
    const h = typeof window !== "undefined" ? window.location.host : "";
    setHost(h);
    fetch("/api/build-label", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { label?: string }) => {
        const next = j.label?.trim() || "";
        if (next && next !== "vercel") setLabel(next);
      })
      .catch(() => {});
  }, []);

  const dev = host && isDevHost(host);
  const display = dev ? "local" : label === "vercel" ? "…" : label;

  return (
    <p
      className="ae-deploy-badge"
      title={
        dev
          ? "Programėlė krauna PC dev serverį (npm run dev)"
          : "Vercel production — commit hash"
      }
    >
      Svetainės versija: <strong>{display}</strong>
      {host ? (
        <>
          {" "}
          · <span className="ae-deploy-badge__host">{host}</span>
        </>
      ) : null}
      {dev ? (
        <>
          {" "}
          — <strong>ne debesis</strong> (pakeiskite URL programėlės nustatymuose)
        </>
      ) : null}
    </p>
  );
}
