import type { Metadata } from "next";
import Link from "next/link";
import { DownloadAppButton } from "@/components/DownloadAppButton";
import { ShareBar } from "@/components/ShareBar";
import { getApkDownloadUrl, getSiteOrigin } from "@/lib/site";

export const metadata: Metadata = {
  title: "Atsisiųsti programėlę | AETERNA",
  description: "AETERNA Android programėlė — memorialai ir parapijos telefone.",
};

export default function DownloadAppPage() {
  const apkUrl = getApkDownloadUrl();
  const site = getSiteOrigin();

  return (
    <section className="ae-section ae-download-page">
      <h1 className="ae-section-title chronicle-serif text-stone-900">AETERNA programėlė</h1>
      <div className="ae-divider" />
      <p className="ae-download-page__lead">
        Android programėlė atidaro memorialus ir parapijų puslapius — veikia per mobilųjį internetą,
        be namų Wi‑Fi.
      </p>

      <a
        href={apkUrl}
        download="aeterna.apk"
        target="_blank"
        rel="noopener noreferrer"
        className="ae-btn ae-btn--gold ae-download-page__direct"
      >
        Atsisiųsti aeterna.apk
      </a>

      <DownloadAppButton showHint className="ae-download-page__cta" />

      <p className="ae-hint" style={{ textAlign: "center", marginTop: "1rem" }}>
        Tiesioginė nuoroda:{" "}
        <a href={apkUrl} download="aeterna.apk" target="_blank" rel="noopener noreferrer" className="ae-map-popup-link">
          {apkUrl.replace(/^https:\/\//, "")}
        </a>
      </p>

      <ol className="ae-download-page__steps">
        <li>Atsisiųskite APK ir atidarykite failą.</li>
        <li>Jei reikia — įjunkite „Įdiegti nežinomą programą“ šiam naršyklės ar failų šaltiniui.</li>
        <li>Po įdiegimo atidarykite AETERNA — pavyzdinis metraštis pasiekiamas iš karto.</li>
      </ol>

      <div className="ae-download-page__share">
        <h2 className="ae-memorial-section-title">Pasidalinkite su artimaisiais</h2>
        <ShareBar
          title="AETERNA — skaitmeninis atminimas"
          text="Atsisiųskite AETERNA programėlę arba atidarykite memorialą naršyklėje."
          url={`${site}/atsisiusti`}
        />
      </div>

      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        <Link href="/m/ona-demo" className="ae-btn ae-btn--outline">
          Kaip atrodo skaitmeninis atminimas
        </Link>
      </p>
    </section>
  );
}
