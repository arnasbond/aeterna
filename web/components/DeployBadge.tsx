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

/** Versija + iš kur kraunama (telefonas dažnai rodo local = ne Vercel URL). */
export function DeployBadge() {
  const [label, setLabel] = useState<string>("…");
  const [host, setHost] = useState("");

  useEffect(() => {
    const h = typeof window !== "undefined" ? window.location.host : "";
    setHost(h);
    fetch("/api/build-label", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { label?: string }) => {
        setLabel(j.label?.trim() || "?");
      })
      .catch(() => setLabel("?"));
  }, []);

  const dev = host && isDevHost(host);

  return (
    <p
      className="ae-deploy-badge"
      title={
        dev
          ? "Programėlė ar nustatymai krauna dev serverį — nustatykite https://aeterna-mauve.vercel.app"
          : "Production Vercel deploy versija"
      }
    >
      Svetainės versija: <strong>{dev ? "local" : label}</strong>
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
