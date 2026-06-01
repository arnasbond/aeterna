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
    <section className="ae-section ae-section--white ae-download-page">
      <h1 className="ae-section-title">AETERNA programėlė</h1>
      <div className="ae-divider" />
      <p className="ae-download-page__lead">
        Android programėlė atidaro memorialus ir parapijų puslapius — veikia per mobilųjį internetą,
        be namų Wi‑Fi.
      </p>

      <DownloadAppButton showHint className="ae-download-page__cta" />

      <p className="ae-hint" style={{ textAlign: "center", marginTop: "1rem" }}>
        Tiesioginė APK nuoroda:{" "}
        <a href={apkUrl} download="aeterna.apk" className="ae-map-popup-link">
          aeterna.apk
        </a>
      </p>

      <ol className="ae-download-page__steps">
        <li>Atsisiųskite APK ir atidarykite failą.</li>
        <li>Jei reikia — įjunkite „Įdiegti nežinomą programą“ šiam naršyklės ar failų šaltiniui.</li>
        <li>Po įdiegimo atidarykite AETERNA — demo memorialas pasiekiamas iš karto.</li>
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
          Demo memorialas
        </Link>
      </p>
    </section>
  );
}
