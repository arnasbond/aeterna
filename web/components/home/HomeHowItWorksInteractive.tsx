"use client";

import Link from "next/link";
import { useState } from "react";

const STEPS = [
  {
    id: 1,
    title: "Nuskenuokite QR kodą",
    text: "Kapinėse pakanka telefono — AETERNA plokštelė ant paminklo atveria memorialą.",
    screen: "scan" as const,
  },
  {
    id: 2,
    title: "Atverkite atmintį",
    text: "Viena skaitmeninė erdvė šeimai — nuotraukos, istorija ir kapo vieta žemėlapyje.",
    screen: "profile" as const,
  },
  {
    id: 3,
    title: "Prisiminkite kartu",
    text: "Galerija, video, virtuali žvakutė ir parama pasirinktai parapijai.",
    screen: "together" as const,
  },
] as const;

const EXAMPLE = "/m/ona-demo";

function PhonePreview({ screen }: { screen: (typeof STEPS)[number]["screen"] }) {
  if (screen === "scan") {
    return (
      <div className="ae-how-phone__view ae-how-phone__view--scan">
        <div className="ae-how-phone__qr-mini" aria-hidden />
        <p>Skenuokite QR…</p>
      </div>
    );
  }
  if (screen === "profile") {
    return (
      <div className="ae-how-phone__view ae-how-phone__view--profile">
        <div className="ae-how-phone__profile-bar" />
        <div className="ae-how-phone__profile-name">Stasė</div>
        <div className="ae-how-phone__profile-lines" />
      </div>
    );
  }
  return (
    <div className="ae-how-phone__view ae-how-phone__view--together">
      <div className="ae-how-phone__tabs">
        <span className="ae-how-phone__tab ae-how-phone__tab--on">Nuotraukos</span>
        <span className="ae-how-phone__tab">Žvakutė</span>
      </div>
      <div className="ae-how-phone__grid" aria-hidden />
    </div>
  );
}

export function HomeHowItWorksInteractive() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <div className="ae-how-interactive">
      <div className="ae-how-interactive__steps">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`ae-how-step${active === i ? " ae-how-step--active" : ""}`}
            onClick={() => setActive(i)}
            aria-pressed={active === i}
          >
            <span className="vk-step-num">{s.id}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </button>
        ))}
      </div>

      <div className="ae-how-interactive__phone-wrap" aria-live="polite">
        <div className="ae-how-phone">
          <div className="ae-how-phone__shell">
            <PhonePreview screen={step.screen} />
          </div>
          <p className="ae-how-phone__caption">{step.title}</p>
        </div>
      </div>

      <p className="vk-section__cta">
        <Link href={EXAMPLE} className="vk-btn vk-btn--primary">
          Pamatyti gyvą pavyzdį →
        </Link>
      </p>
    </div>
  );
}
