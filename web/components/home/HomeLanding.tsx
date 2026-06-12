import Link from "next/link";
import { DownloadAppButton } from "@/components/DownloadAppButton";
import { AboutInitiative } from "@/components/home/AboutInitiative";
import { HomeHowItWorksInteractive } from "@/components/home/HomeHowItWorksInteractive";
import { MemorialSearchBox } from "@/components/home/MemorialSearchBox";
import { GLASS_CARD } from "@/lib/glass-card";

const EXAMPLE = "/m/ona-demo";
const siteBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://aeterna-mauve.vercel.app";
const exampleQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&color=0F2519&bgcolor=ffffff&data=${encodeURIComponent(`${siteBase}${EXAMPLE}`)}`;

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
      <section className="relative px-6 py-16 text-center lg:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#0F2519]/75 sm:text-sm">
            Pasaulinis lietuvių atminimo tinklas
          </p>
          <h1 className="font-serif text-4xl font-bold leading-[1.08] tracking-tight text-stone-900 lg:text-6xl">
            Išsaugokite šeimos istoriją amžiams
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#0A1A10]/80 sm:text-lg">
            Skaitmeninis metraštis — iš bet kurio pasaulio krašto.
          </p>
          <div className="mt-10">
            <MemorialSearchBox />
          </div>
        </div>
      </section>

      <AboutInitiative />

      <section className="vk-section vk-section--airy vk-section--center" id="video">
        <div className="vk-container">
          <span className="vk-badge">Pavyzdys</span>
          <h2 className="vk-title text-stone-900">Kaip atrodo skaitmeninis atminimas</h2>
          <p className="vk-subtitle vk-subtitle--center text-[#0A1A10]/75">
            Peržiūrėkite gyvą memorialinį metraštį — be registracijos.
          </p>
          <Link href={EXAMPLE} className={`vk-video-card block overflow-hidden ${GLASS_CARD}`}>
            <img
              src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80"
              alt=""
            />
            <span className="vk-video-card__play" aria-hidden>
              ▶
            </span>
            <span className="vk-video-card__label">Atidaryti pavyzdį</span>
          </Link>
        </div>
      </section>

      <section className="vk-section vk-section--airy" id="kaip-veikia">
        <div className="vk-container">
          <div className="vk-section-head vk-section-head--center">
            <span className="vk-badge">Kaip veikia</span>
            <h2 className="vk-title vk-title--center text-stone-900">Kapinėse ir telefone</h2>
            <p className="vk-subtitle vk-subtitle--center text-[#0A1A10]/75">
              Paspauskite žingsnį — pamatysite, ką mato lankytojas.
            </p>
          </div>
          <HomeHowItWorksInteractive />
        </div>
      </section>

      <section className="vk-section vk-section--airy vk-section--lavender vk-qr-band">
        <div className="vk-container vk-qr-band__inner">
          <div className={`vk-qr-band__code ${GLASS_CARD} !p-4`}>
            <img src={exampleQrUrl} alt="QR kodas memorialiniam puslapiui" width={180} height={180} />
          </div>
          <div>
            <h2 className="vk-title text-stone-900">Nuskenuokite QR kodą</h2>
            <p className="vk-subtitle text-[#0A1A10]/75" style={{ marginLeft: 0, textAlign: "left" }}>
              Arba atidarykite metraštį naršyklėje — nuotraukos, žvakutė ir navigacija iki kapo.
            </p>
            <Link href={EXAMPLE} className="vk-btn vk-btn--primary">
              Apžiūrėti metraštį →
            </Link>
          </div>
        </div>
      </section>

      <section className="vk-section vk-section--airy">
        <div className="vk-container">
          <div className="vk-section-head vk-section-head--center">
            <span className="vk-badge">Privalumai</span>
            <h2 className="vk-title vk-title--center text-stone-900">Kodėl AETERNA?</h2>
          </div>
          <div className="vk-hscroll vk-hscroll--benefits" role="list">
            {BENEFITS.map((b) => (
              <article
                key={b.title}
                className={`vk-hscroll-card vk-hscroll-card--benefit ${GLASS_CARD}`}
                role="listitem"
              >
                <span className="vk-hscroll-card__icon" aria-hidden>
                  {b.icon}
                </span>
                <h3 className="text-stone-900">{b.title}</h3>
                <p className="text-[#0A1A10]/70">{b.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="vk-section vk-section--airy vk-final-cta">
        <div className="vk-container vk-section--center">
          <h2 className="vk-title text-stone-900">Pradėkite skaitmeninę atmintį</h2>
          <p className="vk-subtitle text-[#0A1A10]/75">Keturi žingsniai — registracija, memorialas, QR ir pasidalinimas.</p>
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
      </section>
    </>
  );
}
