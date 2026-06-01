"use client";

import { useEffect, useState } from "react";
import { fetchMapData, searchParishes, type MapData, type Parish } from "@/lib/api";
import { ParishMap } from "@/components/ParishMap";
import Link from "next/link";

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
      <div className="ae-map-header">
        <div>
          <h1 className="ae-section-title" style={{ marginBottom: "0.5rem" }}>
            Parapijų žemėlapis
          </h1>
          <p style={{ color: "var(--ae-muted)", margin: 0, maxWidth: "36rem" }}>
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
      {data && <ParishMap data={data} />}
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
