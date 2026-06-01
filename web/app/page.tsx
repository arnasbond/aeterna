import { HomeLanding } from "@/components/home/HomeLanding";
import { CandleSection } from "@/components/CandleSection";
import { MassBookingSection } from "@/components/MassBookingSection";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <HomeLanding />
      <CandleSection />
      <MassBookingSection />

      <section id="parama" className="ae-section ae-section--green ae-home-parish">
        <div className="ae-home-parish__inner">
          <div className="ae-home-parish__chart" aria-hidden>
            <div className="ae-donate-ring">
              <svg viewBox="0 0 120 120" className="ae-donate-ring__svg">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="var(--ae-accent)"
                  strokeWidth="12"
                  strokeDasharray="65 327"
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <span className="ae-donate-ring__label">20%</span>
              <span className="ae-donate-ring__sub">parapijai</span>
            </div>
          </div>
          <div>
            <h2 className="ae-section-title" style={{ color: "#fff", textAlign: "left" }}>
              Kiekvienas užsakymas remia bažnyčią
            </h2>
            <p style={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.75, marginBottom: "1.25rem" }}>
              Pasirinkite parapiją žemėlapyje ar sąraše. Dalis sumos automatiškai skiriama
              parapijos fondams — socialinei pagalbai, šventovės priežiūrai ir bendruomenei.
            </p>
            <ul className="ae-home-parish__list">
              <li>Skaidrus paskirstymas kiekvienoje sąskaitoje</li>
              <li>Ilgalaikis duomenų saugojimas (25+ metų architektūra)</li>
              <li>Mišios ir virtualios žvakutės toje pačioje ekosistemoje</li>
            </ul>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <Link href="/map" className="ae-btn ae-btn--gold">
                Parapijų žemėlapis
              </Link>
              <Link href="/parishes" className="ae-btn ae-btn--outline" style={{ borderColor: "#fff", color: "#fff" }}>
                Visos parapijos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
