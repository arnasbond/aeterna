import Link from "next/link";
import { GLASS_CARD } from "@/lib/glass-card";

export function AboutInitiative() {
  return (
    <section className="vk-section vk-section--airy vk-about-initiative" id="apie">
      <div className="vk-container vk-about-initiative__inner vk-about-initiative__inner--compact">
        <div className={`vk-about-initiative__copy ${GLASS_CARD} !p-6 sm:!p-8`}>
          <span className="vk-badge">Apie iniciatyvą</span>
          <h2 className="vk-title text-stone-900">Dvasinis tiltas tarp parapijų ir pasaulio lietuvių</h2>
          <p className="vk-subtitle vk-about-initiative__lead text-[#0A1A10]/75">
            Šeimos išsaugo artimųjų istorijas skaitmeniniame metraštyje — parapijos sulaukia skaidrios paramos iš
            viso pasaulio.
          </p>
          <div className="vk-about-initiative__actions">
            <Link href="/wizard" className="vk-btn vk-btn--primary !bg-[#0F2519] hover:!bg-[#0A1A10]">
              Pradėti memorialą
            </Link>
            <Link href="/qr-ploksteles" className="vk-btn vk-btn--outline !border-[#D4AF37]/40 !text-[#0A1A10]">
              Atminimo plokštelės
            </Link>
          </div>
        </div>
        <blockquote className={`vk-about-initiative__quote chronicle-serif ${GLASS_CARD} !p-6 sm:!p-8`}>
          <p className="text-[#0A1A10]">„Kiekvienas žmogus palieka šviesą — mes padedame ją matyti kitoms kartoms.“</p>
        </blockquote>
      </div>
    </section>
  );
}
