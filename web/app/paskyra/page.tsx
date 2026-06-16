"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HerculesPageShell } from "@/components/layout/HerculesPageShell";
import {
  approveGuestbookEntry,
  clearUserToken,
  fetchOwnerGuestbook,
  fetchUserMe,
  fetchUserMemorials,
  getUserToken,
  type GuestbookEntry,
  type OwnedMemorial,
  type UserAccount,
} from "@/lib/api";

const MAX_MEMORIALS = 7;

export default function PaskyraPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [memorials, setMemorials] = useState<OwnedMemorial[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [guestbookQueues, setGuestbookQueues] = useState<Record<string, GuestbookEntry[]>>({});
  const [approveBusy, setApproveBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!getUserToken()) {
      router.replace("/prisijungti?next=/paskyra");
      return;
    }
    Promise.all([fetchUserMe(), fetchUserMemorials()])
      .then(async ([u, list]) => {
        setUser(u);
        setMemorials(list);
        const pending = list.filter((m) => (m.pendingGuestbookCount ?? 0) > 0);
        const queues = await Promise.all(
          pending.map(async (m) => {
            const rows = await fetchOwnerGuestbook(m.slug);
            return [
              m.slug,
              rows.filter((g) => !g.isApproved && g.status !== "rejected"),
            ] as const;
          })
        );
        setGuestbookQueues(Object.fromEntries(queues.filter(([, rows]) => rows.length > 0)));
      })
      .catch((e) => {
        clearUserToken();
        router.replace("/prisijungti?next=/paskyra");
        setErr(e instanceof Error ? e.message : "Klaida");
      });
  }, [router]);

  function logout() {
    clearUserToken();
    router.push("/");
  }

  if (!user) {
    return (
      <HerculesPageShell narrow center>
        <p className="ae-hint" style={{ textAlign: "center" }}>
          Kraunama…
        </p>
      </HerculesPageShell>
    );
  }

  return (
    <HerculesPageShell narrow title="Mano paskyra">
      <p className="ae-auth__lead">
        Sveiki, <strong>{user.fullName}</strong> ({user.email}). Čia valdote savo atminties profilius — iki{" "}
        {MAX_MEMORIALS} vienoje paskyroje.
      </p>

      {err && <p className="ae-error">{err}</p>}

      <div className="ae-paskyra-actions">
        <Link
          href="/wizard?naujas=1"
          className={`ae-btn ae-btn--primary${memorials.length >= MAX_MEMORIALS ? " ae-btn--disabled" : ""}`}
          aria-disabled={memorials.length >= MAX_MEMORIALS}
          onClick={(e) => {
            if (memorials.length >= MAX_MEMORIALS) e.preventDefault();
          }}
        >
          + Nauja atmintis
        </Link>
        <button type="button" className="ae-btn ae-btn--outline" onClick={logout}>
          Atsijungti
        </button>
      </div>

      {memorials.length >= MAX_MEMORIALS && (
        <p className="ae-hint" style={{ textAlign: "center", marginBottom: "1rem" }}>
          Pasiektas limitas ({MAX_MEMORIALS} profiliai). Redaguokite esamus arba susisiekite su mumis.
        </p>
      )}

      <div className="ae-divider" />

      {Object.keys(guestbookQueues).length > 0 && (
        <section className="ae-card" style={{ marginBottom: "1.5rem", padding: "1.25rem" }}>
          <h2 className="hercules-page__title chronicle-serif" style={{ fontSize: "1.15rem", margin: "0 0 0.5rem" }}>
            Laukiančios užuojautos
          </h2>
          <p className="ae-hint" style={{ margin: "0 0 1rem" }}>
            Patvirtinkite žinutes vienu paspaudimu — tik patvirtintos rodomos viešame memorialiniame puslapyje.
          </p>
          {Object.entries(guestbookQueues).map(([slug, rows]) => {
            const memorial = memorials.find((m) => m.slug === slug);
            return (
              <div key={slug} style={{ marginBottom: "1rem" }}>
                <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>{memorial?.fullName ?? slug}</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {rows.map((g) => (
                    <li
                      key={g.id}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        padding: "0.65rem 0",
                        borderTop: "1px solid rgba(212, 175, 55, 0.15)",
                      }}
                    >
                      <div style={{ flex: "1 1 10rem", minWidth: 0 }}>
                        <strong style={{ fontSize: "0.92rem" }}>{g.authorName}</strong>
                        <p
                          style={{
                            margin: "0.25rem 0 0",
                            fontSize: "0.88rem",
                            whiteSpace: "pre-wrap",
                            opacity: 0.9,
                          }}
                        >
                          {g.message.length > 120 ? `${g.message.slice(0, 120)}…` : g.message}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="ae-btn ae-btn--primary"
                        disabled={approveBusy === g.id}
                        onClick={async () => {
                          setApproveBusy(g.id);
                          try {
                            await approveGuestbookEntry(slug, g.id);
                            const fresh = await fetchOwnerGuestbook(slug);
                            const stillPending = fresh.filter((e) => !e.isApproved && e.status !== "rejected");
                            setGuestbookQueues((prev) => {
                              const next = { ...prev };
                              if (stillPending.length === 0) delete next[slug];
                              else next[slug] = stillPending;
                              return next;
                            });
                            setMemorials((prev) =>
                              prev.map((m) =>
                                m.slug === slug
                                  ? { ...m, pendingGuestbookCount: stillPending.length }
                                  : m
                              )
                            );
                          } finally {
                            setApproveBusy(null);
                          }
                        }}
                      >
                        {approveBusy === g.id ? "…" : "✓ Rodyti viešai"}
                      </button>
                    </li>
                  ))}
                </ul>
                <Link href={`/paskyra/atmintis/${slug}`} className="ae-hint" style={{ fontSize: "0.85rem" }}>
                  Visos užuojautos →
                </Link>
              </div>
            );
          })}
        </section>
      )}

      <h2 className="hercules-page__title chronicle-serif" style={{ fontSize: "1.25rem" }}>
        Mano atminties profiliai
      </h2>

      {memorials.length === 0 ? (
        <p className="ae-hint" style={{ textAlign: "center" }}>
          Dar neturite sukurtų profilių.{" "}
          <Link href="/wizard?naujas=1">Pradėkite kūrimo vedlys →</Link>
        </p>
      ) : (
        <ul className="ae-paskyra-list">
          {memorials.map((m) => (
            <li key={m.id} className="ae-card ae-paskyra-item">
              <div>
                <h3 className="chronicle-serif">
                  {m.fullName}
                  {(m.pendingGuestbookCount ?? 0) > 0 && (
                    <span
                      className="ae-hint"
                      style={{
                        marginLeft: "0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#c4a574",
                      }}
                    >
                      · {m.pendingGuestbookCount} laukia patvirtinimo
                    </span>
                  )}
                </h3>
                <p className="ae-hint">
                  {m.birthDate ?? "—"} — {m.deathDate ?? "—"}
                </p>
              </div>
              <div className="ae-paskyra-item__actions">
                <Link href={`/m/${m.slug}`} className="ae-btn ae-btn--outline">
                  Peržiūrėti
                </Link>
                <Link href={`/paskyra/atmintis/${m.slug}`} className="ae-btn ae-btn--primary">
                  Redaguoti
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </HerculesPageShell>
  );
}
