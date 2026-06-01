"use client";

import { useEffect, useState } from "react";
import { fetchMemorialCandles, formatEuro, type VirtualCandle } from "@/lib/api";

export function VirtualCandles({ slug }: { slug: string }) {
  const [candles, setCandles] = useState<VirtualCandle[]>([]);

  useEffect(() => {
    fetchMemorialCandles(slug).then(setCandles).catch(() => setCandles([]));
  }, [slug]);

  if (candles.length === 0) return null;

  return (
    <section className="ae-candles-list">
      <h2 className="ae-candles-list__title">Degančios žvakutės</h2>
      <ul>
        {candles.map((c) => (
          <li key={c.id} className="ae-candle-item">
            <span className="ae-candle-item__flame" aria-hidden>
              🕯️
            </span>
            <div>
              <strong>{c.donorName}</strong> uždegė žvakutę
              <br />
              <span className="ae-candle-item__meta">
                {new Date(c.litAt).toLocaleString("lt-LT")} · {formatEuro(c.donationAmountCents)} parapijai
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
