"use client";



import { useEffect, useState } from "react";

import Link from "next/link";

import { HerculesPageShell } from "@/components/layout/HerculesPageShell";

import { fetchParishes, type Parish } from "@/lib/api";

import { parishCardImage } from "@/lib/parish-image";



export default function ParishesPage() {

  const [list, setList] = useState<Parish[]>([]);

  const [err, setErr] = useState<string | null>(null);



  useEffect(() => {

    fetchParishes()

      .then(setList)

      .catch((e) => setErr(e.message));

  }, []);



  return (

    <HerculesPageShell

      title="Parapijos"

      lead="Pasirinkite parapiją, kuriai skiriama 20 % nuo kiekvienos apmokamos sumos (narystė, Premium, žvakutė, mišios)."

      center

    >

      <p className="mb-8 text-center">

        <Link href="/map" className="ae-btn ae-btn--outline">

          Atidaryti interaktyvų žemėlapį

        </Link>

      </p>

      {err && <p className="ae-error" style={{ textAlign: "center" }}>{err}</p>}

      <div className="ae-parish-grid">

        {list.map((p) => (

          <article key={p.id} className="ae-card ae-parish-card">

            <img

              src={parishCardImage(p.image, undefined, p.diocese)}

              alt=""

              loading="lazy"

              referrerPolicy="no-referrer"

              className="hercules-parish-card__img"

            />

            <span className="ae-badge">{p.diocese}</span>

            <h3 className="chronicle-serif" style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>

              {p.title}

            </h3>

            <p className="ae-hint" style={{ margin: "0 0 1rem" }}>

              {p.supportGoal}

            </p>

            <Link

              href={`/parishes/${encodeURIComponent(p.id)}`}

              className="ae-btn ae-btn--primary"

              style={{ display: "block", width: "100%", marginBottom: "0.5rem" }}

            >

              Parapijos puslapis

            </Link>

            <Link

              href={`/wizard?parish=${encodeURIComponent(p.id)}`}

              className="ae-btn ae-btn--outline"

              style={{ display: "block", width: "100%" }}

            >

              Sukurti atmintį

            </Link>

          </article>

        ))}

      </div>

    </HerculesPageShell>

  );

}

