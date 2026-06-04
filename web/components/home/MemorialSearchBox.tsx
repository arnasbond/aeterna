"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { searchMemorials, type MemorialSearchHit } from "@/lib/api";

function formatYears(birth: string | null, death: string | null) {
  const y = (d: string | null) => {
    if (!d) return "—";
    try {
      return new Date(d).getFullYear();
    } catch {
      return d.slice(0, 4);
    }
  };
  return `${y(birth)} – ${y(death)}`;
}

export function MemorialSearchBox() {
  const router = useRouter();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<MemorialSearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [searched, setSearched] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [buildLabel, setBuildLabel] = useState(
    () => process.env.NEXT_PUBLIC_BUILD_LABEL || ""
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/build-label", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { label?: string }) => {
        if (!cancelled && j.label) setBuildLabel(j.label);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const runSearch = useCallback(async (value: string) => {
    const q = value.trim();
    if (q.length < 1) {
      setHits([]);
      setOpen(false);
      setSearched(false);
      setApiError(false);
      return;
    }
    setLoading(true);
    setSearched(false);
    setApiError(false);
    try {
      const data = await searchMemorials(q, 8);
      setHits(data);
      setOpen(true);
      setSearched(true);
      setActive(data.length > 0 ? 0 : -1);
    } catch {
      setHits([]);
      setOpen(true);
      setSearched(true);
      setApiError(true);
      setActive(-1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void runSearch(query);
    }, 220);
    return () => window.clearTimeout(t);
  }, [query, runSearch]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function goTo(hit: MemorialSearchHit) {
    setOpen(false);
    setQuery(hit.fullName);
    router.push(`/m/${hit.slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || hits.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        void runSearch(query);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? hits.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0 && hits[active]) {
      e.preventDefault();
      goTo(hits[active]!);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} id="atminties-paieska" className="ae-memorial-search">
      <label htmlFor={`${listId}-input`} className="ae-memorial-search__label">
        Ieškoti atminties
      </label>
      <div className="ae-memorial-search__field">
        <span className="ae-memorial-search__icon" aria-hidden>
          🔍
        </span>
        <input
          id={`${listId}-input`}
          type="search"
          className="ae-memorial-search__input"
          placeholder="Įveskite vardą — pvz. V → vardenis pavardenis"
          value={query}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${listId}-list`}
          aria-autocomplete="list"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (hits.length > 0) setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
        {loading && <span className="ae-memorial-search__spinner" aria-hidden />}
      </div>

      {apiError && searched && (
        <p className="ae-memorial-search__empty" role="alert">
          Paieškos serveris laikinai nepasiekiamas. Bandykite pavyzdžius žemiau.
        </p>
      )}

      {open && hits.length > 0 && (
        <ul id={`${listId}-list`} className="ae-memorial-search__list" role="listbox">
          {hits.map((hit, i) => (
            <li key={hit.slug} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={`ae-memorial-search__item${i === active ? " ae-memorial-search__item--active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => goTo(hit)}
              >
                {hit.portraitUrl ? (
                  <img src={hit.portraitUrl} alt="" className="ae-memorial-search__thumb" />
                ) : (
                  <span className="ae-memorial-search__thumb ae-memorial-search__thumb--empty" aria-hidden>
                    ✦
                  </span>
                )}
                <span className="ae-memorial-search__meta">
                  <strong>{hit.fullName}</strong>
                  <small>{formatYears(hit.birthDate, hit.deathDate)}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && searched && query.trim().length >= 1 && hits.length === 0 && !apiError && (
        <p className="ae-memorial-search__empty">Nerasta. Bandykite kitą raides arba vardą.</p>
      )}

      <p className="ae-memorial-search__hint">
        {buildLabel && buildLabel !== "local" && buildLabel !== "vercel" && buildLabel !== "…" && (
          <>
            <span className="ae-memorial-search__build">v.{buildLabel}</span>
            {" · "}
          </>
        )}
        Pavyzdys:{" "}
        <Link href="/m/ona-demo" className="ae-memorial-search__example">
          Stasė (demo)
        </Link>
        {" · "}
        <Link href="/m/vardenis-pavardenis" className="ae-memorial-search__example">
          vardenis pavardenis
        </Link>
      </p>
    </div>
  );
}
