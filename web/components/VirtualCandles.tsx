"use client";

import { useEffect, useState } from "react";
import { fetchMemorialCandles, formatEuro, type VirtualCandle } from "@/lib/api";

type Props = {
  slug: string;
  parishTitle: string;
};

export function VirtualCandles({ slug, parishTitle }: Props) {
  const [candles, setCandles] = useState<VirtualCandle[]>([]);

  useEffect(() => {
    fetchMemorialCandles(slug).then(setCandles).catch(() => setCandles([]));
  }, [slug]);

  if (candles.length === 0) {
    return (
      <p className="ae-hint" style={{ textAlign: "center", padding: "0.5rem 0" }}>
        Dar niekas neuždegė žvakutės. Būkite pirmieji.
      </p>
    );
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {candles.map((c) => (
        <li key={c.id} className="ch-candle-glow">
          <span className="ch-candle-glow__flame" aria-hidden>
            🕯️
          </span>
          <div>
            <strong>{c.donorName}</strong> uždegė žvakutę ({formatEuro(c.donationAmountCents)} auka {parishTitle}{" "}
            bažnyčiai)
            <br />
            <span style={{ fontSize: "0.78rem", color: "var(--ch-muted)" }}>
              {new Date(c.litAt).toLocaleString("lt-LT")}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
