import { HomeLanding } from "@/components/home/HomeLanding";
import { CandleSection } from "@/components/CandleSection";
import { MassBookingSection } from "@/components/MassBookingSection";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <HomeLanding />

      <div className="vk-home-extra">
        <MassBookingSection />
        <CandleSection />
      </div>

      <section id="parama" className="vk-parish-band">
        <div className="vk-container">
          <div className="ae-home-parish__inner" style={{ display: "grid", gap: "2rem", alignItems: "center" }}>
            <div className="ae-home-parish__chart" aria-hidden>
              <div className="ae-donate-ring">
                <svg viewBox="0 0 120 120" className="ae-donate-ring__svg">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="12"
                    strokeDasharray="65 327"
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <span className="ae-donate-ring__label" style={{ color: "#fff" }}>
                  100%
                </span>
                <span className="ae-donate-ring__sub" style={{ color: "rgba(255,255,255,0.85)" }}>
                  aukos parapijai
                </span>
              </div>
            </div>
            <div>
              <h2 className="ae-section-title" style={{ textAlign: "left" }}>
                Virtuali žvakutė ir mišios remia parapiją
              </h2>
              <p style={{ color: "rgba(255,255,255,0.92)", lineHeight: 1.75, marginBottom: "1.25rem" }}>
                Skaitmeninė narystė (39 €) finansuoja platformą. O kai uždegate žvakutę ar užsakote Šv. Mišias —
                visa auka keliauja į pasirinktą parapiją (platformos aptarnavimas +0,50 €).
              </p>
              <ul className="ae-home-parish__list" style={{ color: "rgba(255,255,255,0.9)" }}>
                <li>Skaidrus aukų ataskaitavimas parapijų skydelyje</li>
                <li>Memorialas, mišios ir žvakutė vienoje platformoje</li>
                <li>Parapijų žemėlapis ir profiliai</li>
              </ul>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem" }}>
                <Link href="/map" className="vk-btn vk-btn--white">
                  Parapijų žemėlapis
                </Link>
                <Link href="/parishes" className="vk-btn vk-btn--outline">
                  Visos parapijos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
