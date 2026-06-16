import Link from "next/link";
import { HERCULES_CHURCH_IMAGE, HERCULES_FLOAT, HERCULES_REVEAL } from "@/lib/hercules-theme";

export function AboutInitiative() {
  return (
    <>
      <section className="hercules-quote-band hercules-reveal" aria-label="Citata">
        <blockquote>
          „Kiekvienas žmogus palieka šviesą — mes padedame ją matyti kitoms kartoms.“
        </blockquote>
      </section>

      <section className="hercules-about" id="apie">
        <div className="hercules-about__grid">
          <div className={`hercules-about__copy hercules-float--static ${HERCULES_FLOAT} ${HERCULES_REVEAL} hercules-reveal-delay-1`}>
            <span className="hercules-eyebrow">Apie iniciatyvą</span>
            <h2 className="hercules-section-title">
              Dvasinis tiltas tarp
              <br />
              parapijų ir pasaulio lietuvių
            </h2>
            <p className="hercules-section-lead">
              Šeimos išsaugo artimųjų istorijas skaitmeniniame metraštyje — parapijos sulaukia skaidrios paramos iš
              viso pasaulio.
            </p>
            <div className="hercules-about__actions">
              <Link href="/wizard" className="hercules-btn-white">
                Pradėti memorialą <span aria-hidden>→</span>
              </Link>
              <Link href="/qr-ploksteles" className="hercules-btn-ghost">
                Atminimo plokštelės
              </Link>
            </div>
          </div>
          <div className={`hercules-about__visual ${HERCULES_FLOAT} hercules-float--static ${HERCULES_REVEAL} hercules-reveal-delay-2`}>
            <img src={HERCULES_CHURCH_IMAGE} alt="" loading="lazy" decoding="async" />
            <div className="hercules-stat-box">
              <div className="hercules-stat-box__value">100%</div>
              <div className="hercules-stat-box__label">aukų keliauja į parapiją</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
