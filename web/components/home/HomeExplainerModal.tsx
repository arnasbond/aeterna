"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DEMO = "/m/ona-demo";

export function HomeExplainerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="ae-explainer-float"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span className="ae-explainer-float__icon" aria-hidden>
          ▶
        </span>
        <span>Kaip veikia AETERNA ir QR kodas ant kapo?</span>
      </button>

      {open && (
        <div className="ae-modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="ae-modal"
            role="dialog"
            aria-modal
            aria-labelledby="ae-explainer-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="ae-modal__close" onClick={() => setOpen(false)} aria-label="Uždaryti">
              ×
            </button>
            <h2 id="ae-explainer-title" className="ae-modal__title">
              Kaip AETERNA sujungia kapą ir telefoną
            </h2>
            <p className="ae-modal__lead">
              Ant paminklo — memorialinė QR plokštelė. Nuskenavus — atsidaro skaitmeninė atmintis su nuotraukomis,
              žvakute ir parama parapijai.
            </p>
            <div className="ae-modal__video">
              <video
                src="https://assets.mixkit.co/videos/5383/5383-720.mp4"
                controls
                playsInline
                preload="metadata"
                poster="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80"
              />
            </div>
            <div className="ae-modal__actions">
              <Link href={DEMO} className="vk-btn vk-btn--primary" onClick={() => setOpen(false)}>
                Atidaryti demo memorialą
              </Link>
              <Link href="/wizard" className="vk-btn vk-btn--outline" onClick={() => setOpen(false)}>
                Sukurti atmintį
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
