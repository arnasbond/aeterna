import Link from "next/link";
import { DownloadAppButton } from "@/components/DownloadAppButton";
import { AboutInitiative } from "@/components/home/AboutInitiative";
import { HomeHowItWorksInteractive } from "@/components/home/HomeHowItWorksInteractive";
import { MemorialSearchBox } from "@/components/home/MemorialSearchBox";
import { HERCULES_CHURCH_IMAGE, HERCULES_FLOAT, HERCULES_HERO_IMAGE, HERCULES_REVEAL } from "@/lib/hercules-theme";

const EXAMPLE = "/m/ona-demo";
const siteBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://aeterna-mauve.vercel.app";
const exampleQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&color=ffffff&bgcolor=1a1a1a&data=${encodeURIComponent(`${siteBase}${EXAMPLE}`)}`;

const BENEFITS = [
  { icon: "✦", title: "Skaitmeninė narystė", text: "Memorialinis puslapis nuo 39 €" },
  { icon: "📍", title: "Pasaulinis žemėlapis", text: "GPS arba rankinė paieška" },
  { icon: "📄", title: "QR kodas ir PDF", text: "Spausdinkite patys arba plokštelė +25 €" },
  { icon: "🕯️", title: "Virtuali žvakutė", text: "100 % aukos parapijai" },
  { icon: "⛪", title: "Šv. Mišios", text: "Užsakykite nuotoliu" },
  { icon: "⭐", title: "Premium", text: "Galerija, video, giminės medis" },
] as const;

export function HomeLanding() {
  return (
    <>
      <section className="hercules-hero">
        <div
          className="hercules-hero__bg"
          style={{ backgroundImage: `url(${HERCULES_HERO_IMAGE})` }}
          aria-hidden
        />
        <div className="hercules-hero__overlay" aria-hidden />
        <div className="hercules-hero__content hercules-reveal">
          <p className="hercules-hero__eyebrow">Pasaulinis lietuvių atminimo tinklas</p>
          <h1 className="hercules-hero__title">
            Išsaugokite šeimos <em>istoriją amžiams</em>
          </h1>
          <p className="hercules-hero__lead">Skaitmeninis metraštis — iš bet kurio pasaulio krašto.</p>
          <MemorialSearchBox variant="hercules" />
        </div>
        <div className="hercules-hero__scroll" aria-hidden />
      </section>

      <AboutInitiative />

      <section className={`vk-section vk-section--airy vk-section--center ${HERCULES_REVEAL}`} id="video">
        <div className="vk-container">
          <div className={`hercules-section-panel ${HERCULES_FLOAT} hercules-float--static`}>
            <span className="vk-badge">Kaip atrodo skaitmeninis atminimas</span>
            <h2 className="vk-title">Peržiūrėkite gyvą memorialinį metraštį</h2>
            <p className="vk-subtitle vk-subtitle--center">Be registracijos.</p>
            <Link href={EXAMPLE} className="vk-video-card block overflow-hidden">
              <img
                src={HERCULES_CHURCH_IMAGE}
                alt=""
              />
              <span className="vk-video-card__play" aria-hidden>
                ▶
              </span>
              <span className="vk-video-card__label">Atidaryti pavyzdį</span>
            </Link>
          </div>
        </div>
      </section>

      <section className={`vk-section vk-section--airy ${HERCULES_REVEAL} hercules-reveal-delay-1`} id="kaip-veikia">
        <div className="vk-container">
          <div className={`hercules-section-panel ${HERCULES_FLOAT} hercules-float--static`}>
            <div className="vk-section-head vk-section-head--center">
              <span className="vk-badge">Kaip veikia</span>
              <h2 className="vk-title vk-title--center">Kapinėse ir telefone</h2>
              <p className="vk-subtitle vk-subtitle--center">
                Paspauskite žingsnio plytelę — atsivers jautri vizualizacija, ką mato lankytojas.
              </p>
            </div>
            <HomeHowItWorksInteractive />
          </div>
        </div>
      </section>

      <section className={`vk-section vk-section--airy vk-section--lavender vk-qr-band ${HERCULES_REVEAL}`} id="qr">
        <div className="vk-container">
          <div className={`vk-qr-band__inner hercules-section-panel ${HERCULES_FLOAT} hercules-float--static`}>
            <div className="vk-qr-band__code !p-4">
              <img src={exampleQrUrl} alt="QR kodas memorialiniam puslapiui" width={180} height={180} />
            </div>
            <div>
              <h2 className="vk-title">Nuskenuokite QR kodą</h2>
              <p className="vk-subtitle" style={{ marginLeft: 0, textAlign: "left" }}>
                Arba atidarykite metraštį naršyklėje — nuotraukos, žvakutė ir navigacija iki kapo.
              </p>
              <Link href={EXAMPLE} className="vk-btn vk-btn--primary">
                Apžiūrėti metraštį →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`vk-section vk-section--airy ${HERCULES_REVEAL} hercules-reveal-delay-1`}>
        <div className="vk-container">
          <div className="vk-section-head vk-section-head--center">
            <span className="vk-badge">Privalumai</span>
            <h2 className="vk-title vk-title--center">Kodėl AETERNA?</h2>
          </div>
          <div className="vk-hscroll vk-hscroll--benefits" role="list">
            {BENEFITS.map((b) => (
              <article key={b.title} className={`vk-hscroll-card vk-hscroll-card--benefit ${HERCULES_FLOAT}`} role="listitem">
                <span className="vk-hscroll-card__icon" aria-hidden>
                  {b.icon}
                </span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`vk-section vk-section--airy vk-final-cta ${HERCULES_REVEAL}`}>
        <div className="vk-container vk-section--center">
          <div className={`hercules-section-panel ${HERCULES_FLOAT} hercules-float--static`}>
            <h2 className="vk-title">Pradėkite skaitmeninę atmintį</h2>
            <p className="vk-subtitle">Keturi žingsniai — registracija, memorialas, QR ir pasidalinimas.</p>
            <div className="vk-final-cta__actions">
              <Link href="/wizard" className="vk-btn vk-btn--primary vk-btn--lg">
                Sukurti atmintį
              </Link>
              <Link href={EXAMPLE} className="vk-btn vk-btn--outline vk-btn--lg">
                Peržiūrėti pavyzdį
              </Link>
              <DownloadAppButton variant="link" className="vk-final-cta__app" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
