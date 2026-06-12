"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearUserToken,
  fetchUserMe,
  fetchUserMemorials,
  getUserToken,
  type OwnedMemorial,
  type UserAccount,
} from "@/lib/api";

const MAX_MEMORIALS = 7;

export default function PaskyraPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [memorials, setMemorials] = useState<OwnedMemorial[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!getUserToken()) {
      router.replace("/prisijungti?next=/paskyra");
      return;
    }
    Promise.all([fetchUserMe(), fetchUserMemorials()])
      .then(([u, list]) => {
        setUser(u);
        setMemorials(list);
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
      <section className="ae-section">
        <p className="ae-hint" style={{ textAlign: "center" }}>
          Kraunama…
        </p>
      </section>
    );
  }

  return (
    <section className="ae-section ae-paskyra-page">
      <h1 className="ae-section-title chronicle-serif">Mano paskyra</h1>
      <p className="ae-auth__lead text-[#0A1A10]/75">
        Sveiki, <strong>{user.fullName}</strong> ({user.email}). Čia valdote savo atminties
        profilius — iki {MAX_MEMORIALS} vienoje paskyroje.
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

      <h2 className="ae-section-title chronicle-serif text-stone-900" style={{ fontSize: "1.25rem" }}>
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
                <h3 className="font-serif text-stone-900">{m.fullName}</h3>
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
    </section>
  );
}
