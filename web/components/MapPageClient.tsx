"use client";

import { useEffect, useState } from "react";
import { fetchMapData, searchParishes, type MapData, type Parish } from "@/lib/api";
import { ParishMap } from "@/components/ParishMap";
import Link from "next/link";
import { GLASS_CARD } from "@/lib/glass-card";

export function MapPageClient() {
  const [data, setData] = useState<MapData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Parish[]>([]);

  useEffect(() => {
    fetchMapData()
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "Nepavyko įkelti žemėlapio"));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      searchParishes(query)
        .then(setResults)
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <section className="ae-section ae-section--map">
      <div className={`ae-map-header ${GLASS_CARD} !mx-auto !mb-6 !max-w-6xl !p-6 sm:!p-8`}>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0F2519]/75">
            Parapijų tinklas
          </p>
          <h1 className="ae-section-title chronicle-serif text-left text-stone-900" style={{ marginBottom: "0.5rem" }}>
            Parapijų žemėlapis
          </h1>
          <p className="m-0 max-w-xl text-[#0A1A10]/75">
            Interaktyvus Lietuvos žemėlapis pagal seniūnijas. Užveskite — pamatysite parapijas; paspauskite —
            pateksite į parapijos skydelį.
          </p>
        </div>
        <div className="ae-map-search">
          <input
            type="search"
            placeholder="Ieškoti parapijos, miesto…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Ieškoti parapijos"
            className="focus:ring-2 focus:ring-[#D4AF37]/40"
          />
          {results.length > 0 && (
            <ul className="ae-map-search-results">
              {results.map((p) => (
                <li key={p.id}>
                  <Link href={`/parishes/${p.id}`}>
                    <strong>{p.title}</strong>
                    <span>{p.city ?? p.deaneryName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {err && <p className="ae-error" style={{ textAlign: "center" }}>{err}</p>}
      {!data && !err && <p className="ae-hint" style={{ textAlign: "center" }}>Kraunamas žemėlapis…</p>}
      {data && (
        <div className={`ae-map-shell ${GLASS_CARD} !mx-auto !max-w-[72rem] overflow-hidden !rounded-2xl !p-0`}>
          <ParishMap data={data} />
        </div>
      )}
      <p className="ae-map-footnote">
        Parapijų sąrašas importuotas iš{" "}
        <a href="https://www.katalikai.lt/index.php?id=53" target="_blank" rel="noreferrer">
          katalikai.lt
        </a>{" "}
        (parapijos su oficialiomis svetainėmis). Žemėlapio sritys — supaprastintos seniūnijos.
      </p>
    </section>
  );
}
