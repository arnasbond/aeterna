import Link from "next/link";

export function AboutInitiative() {
  return (
    <section className="vk-section vk-about-initiative" id="apie">
      <div className="vk-container vk-about-initiative__inner">
        <div className="vk-about-initiative__copy">
          <span className="vk-badge">Apie iniciatyvą</span>
          <h2 className="vk-title">Tikėjimo palikimas, kurį neša bendruomenė</h2>
          <p className="vk-subtitle vk-about-initiative__lead">
            AETERNA gimė iš paprastos minties: artimųjų atmintis ir parapijos gyvenimas gali eiti koja kojon.
            Mes padedame šeimoms išsaugoti gyvenimo istorijas, o parapijoms — sulaukti švelnios, skaidrios paramos
            iš tų, kurie nori prisiminti ir padėti.
          </p>
          <ul className="vk-checklist vk-about-initiative__list">
            <li>Memorialinis metraštis šeimai — nuotraukos, žodžiai ir vieta kapinėse</li>
            <li>QR plokštelė ant paminklo — vienas nuskaitymas atveria visą atmintį</li>
            <li>Virtuali žvakutė ir Šv. Mišios — pagerbimas, kuris remia vietinę parapiją</li>
            <li>Kiekvienas gestas stiprina bendruomenę, kurioje augome ir meldėmės</li>
          </ul>
          <div className="vk-about-initiative__actions">
            <Link href="/wizard" className="vk-btn vk-btn--primary">
              Pradėti memorialą
            </Link>
            <Link href="/qr-ploksteles" className="vk-btn vk-btn--outline vk-btn--qr-highlight">
              Atminimo plokštelės
            </Link>
          </div>
        </div>
        <blockquote className="vk-about-initiative__quote chronicle-serif">
          <p>
            „Kiekvienas žmogus palieka šviesą — mes padedame ją matyti kitoms kartoms ir parapijai, kuri mus
            globojo.“
          </p>
        </blockquote>
      </div>
    </section>
  );
}
