"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { searchParishes, type Parish } from "@/lib/api";

type Props = {
  value: string;
  onChange: (parishId: string, parish?: Parish) => void;
  /** Rodomas pavadinimas, kai parapija jau pasirinkta */
  selectedTitle?: string;
};

export function ParishSearchPicker({ value, onChange, selectedTitle }: Props) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Parish[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);

  const runSearch = useCallback(async (q: string) => {
    const text = q.trim();
    if (text.length < 2) {
      setHits([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchParishes(text);
      setHits(data.slice(0, 12));
      setOpen(data.length > 0);
      setActive(data.length > 0 ? 0 : -1);
    } catch {
      setHits([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void runSearch(query), 280);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(p: Parish) {
    onChange(p.id, p);
    setQuery("");
    setOpen(false);
    setHits([]);
  }

  return (
    <div className="parish-search-picker" ref={wrapRef}>
      {value && selectedTitle && (
        <p className="parish-search-picker__current ae-hint">
          Pasirinkta: <strong>{selectedTitle}</strong>
        </p>
      )}
      <label className="ae-field" style={{ marginBottom: 0 }}>
        <span className="ae-hint" style={{ display: "block", marginBottom: "0.35rem" }}>
          Ieškokite pagal miestą arba parapijos pavadinimą (pvz. „Šiauliai“, „Nekaltojo“)
        </span>
        <input
          type="search"
          className="ae-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hits.length > 0 && setOpen(true)}
          placeholder="Pradėkite rašyti parapijos pavadinimą…"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
        />
      </label>
      {loading && <p className="ae-hint">Ieškoma…</p>}
      {open && hits.length > 0 && (
        <ul id={listId} className="parish-search-picker__list" role="listbox">
          {hits.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                className={i === active ? "is-active" : undefined}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(p)}
              >
                <span className="parish-search-picker__title">{p.title}</span>
                <span className="parish-search-picker__meta">{p.diocese}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length >= 2 && !loading && hits.length === 0 && (
        <p className="ae-hint">Nerasta — pabandykite kitą žodį (miestas, šventasis vardas).</p>
      )}
    </div>
  );
}
