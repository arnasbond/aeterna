"use client";

import Link from "next/link";
import { useState } from "react";

const DEMO = "/m/ona-demo";

type Scene = "idle" | "scanning" | "memorial";

type Props = {
  demoQrUrl: string;
};

export function HomeHeroInteractive({ demoQrUrl }: Props) {
  const [scene, setScene] = useState<Scene>("idle");

  function simulateScan() {
    if (scene === "scanning") return;
    setScene("scanning");
    window.setTimeout(() => setScene("memorial"), 900);
  }

  function resetScene() {
    setScene("idle");
  }

  return (
    <div className="ae-hero-scene">
      <div className="ae-hero-scene__stone" aria-hidden>
        <div className="ae-hero-scene__stone-top" />
        <button
          type="button"
          className={`ae-hero-scene__qr${scene !== "idle" ? " ae-hero-scene__qr--pulse" : ""}`}
          onClick={simulateScan}
          aria-label="Simuliuoti QR kodo skenavimą"
        >
          <img src={demoQrUrl} alt="" width={72} height={72} />
          <span>QR ant kapo</span>
        </button>
        {scene === "scanning" && <span className="ae-hero-scene__scan-line" aria-hidden />}
      </div>

      <div className={`ae-hero-scene__phone${scene === "memorial" ? " ae-hero-scene__phone--on" : ""}`}>
        <div className="ae-hero-scene__phone-notch" aria-hidden />
        <div className="ae-hero-scene__phone-screen">
          {scene === "idle" && (
            <div className="ae-hero-scene__phone-idle">
              <span className="ae-hero-scene__phone-icon" aria-hidden>
                📱
              </span>
              <p>Palieskite QR plokštelę arba mygtuką apačioje</p>
            </div>
          )}
          {scene === "scanning" && (
            <div className="ae-hero-scene__phone-scan">
              <div className="ae-hero-scene__spinner" aria-hidden />
              <p>Skenuojama…</p>
            </div>
          )}
          {scene === "memorial" && (
            <div className="ae-hero-scene__phone-memorial">
              <div className="ae-hero-scene__memorial-head">
                <span className="ae-hero-scene__memorial-avatar" aria-hidden />
                <strong>Stasė Ramonienė</strong>
                <small>1936 – 2024</small>
              </div>
              <p className="ae-hero-scene__memorial-text">Amžina atmintis šeimai — nuotraukos, video, žvakutė.</p>
              <Link href={DEMO} className="ae-hero-scene__memorial-link">
                Atidaryti demo →
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="ae-hero-scene__actions">
        <button type="button" className="vk-btn vk-btn--outline" onClick={simulateScan}>
          {scene === "memorial" ? "Skenuoti dar kartą" : "Simuliuoti skenavimą"}
        </button>
        {scene === "memorial" && (
          <button type="button" className="ae-hero-scene__reset" onClick={resetScene}>
            Iš pradžių
          </button>
        )}
      </div>
    </div>
  );
}
