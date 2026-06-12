import { HomeLanding } from "@/components/home/HomeLanding";
import { HomeFeaturedParishes } from "@/components/home/HomeFeaturedParishes";
import { CandleSection } from "@/components/CandleSection";
import { MassBookingSection } from "@/components/MassBookingSection";
import Link from "next/link";
import { GLASS_CARD } from "@/lib/glass-card";

export default function HomePage() {
  return (
    <div className="vk-home vk-home--light relative">
      <HomeLanding />

      <section className="vk-home-actions">
        <div className="vk-container">
          <div className="vk-home-actions__grid">
            <div className={`${GLASS_CARD} p-5 sm:p-6`}>
              <MassBookingSection presentation="sheet" />
            </div>
            <div className={`${GLASS_CARD} p-5 sm:p-6`}>
              <CandleSection presentation="sheet" />
            </div>
          </div>
        </div>
      </section>

      <HomeFeaturedParishes />

      <section id="parama" className="vk-parish-band vk-section--airy">
        <div className="vk-container">
          <div className={`ae-home-parish__inner vk-parish-band__inner ${GLASS_CARD} !p-6 sm:!p-8 !bg-[#0F2519]/95 !border-[#D4AF37]/20 !text-white`}>
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
              <h2 className="ae-section-title text-stone-100" style={{ textAlign: "left" }}>
                Žvakutė ir mišios remia parapiją
              </h2>
              <p className="vk-parish-band__lead text-white/85">
                Skaitmeninė narystė (39 €) finansuoja platformą. Uždegus žvakutę ar užsakius Šv. Mišias — visa auka
                keliauja į parapiją.
              </p>
              <div className="vk-parish-band__links">
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
    </div>
  );
}
