import Link from "next/link";
import { DownloadAppButton } from "@/components/DownloadAppButton";
import { AboutInitiative } from "@/components/home/AboutInitiative";
import { HomeExplainerModal } from "@/components/home/HomeExplainerModal";
import { HomeHeroInteractive } from "@/components/home/HomeHeroInteractive";
import { MemorialSearchBox } from "@/components/home/MemorialSearchBox";
import { HomeHowItWorksInteractive } from "@/components/home/HomeHowItWorksInteractive";

const EXAMPLE = "/m/ona-demo";
const siteBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://aeterna-mauve.vercel.app";
const exampleQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&color=4a2f7a&bgcolor=ffffff&data=${encodeURIComponent(`${siteBase}${EXAMPLE}`)}`;

const BENEFITS = [
  { icon: "✦", title: "Skaitmeninė narystė", text: "Memorialinis puslapis nuo 39 € — be privalomų plokštelių" },
  { icon: "📍", title: "Pasaulinis žemėlapis", text: "GPS arba rankinė paieška — bet kurioje šalyje" },
  { icon: "📄", title: "QR kodas ir PDF", text: "Atsisiųskite ir spausdinkite patys arba užsisakykite plokštelę (+25 €)" },
  { icon: "📱", title: "Nuskanavus telefonu", text: "Atsidaro visa memorialinė erdvė bet kur" },
  { icon: "🕯️", title: "Virtuali žvakutė", text: "Auka eina parapijai; platformos aptarnavimas +0,50 €" },
  { icon: "⭐", title: "Premium", text: "Neribota galerija, video, giminės medis ir metinių priminimai" },
] as const;

export function HomeLanding() {
  return (
    <>
      <section className="vk-hero vk-hero--immersive">
        <div
          className="vk-hero__bg vk-hero__bg--immersive"
          style={{
            backgroundImage: `linear-gradient(105deg, rgba(250,248,252,0.92) 0%, rgba(250,248,252,0.75) 42%, rgba(250,248,252,0.2) 68%), url("https://images.unsplash.com/photo-1586104158098-0ef8fc4b67b4?auto=format&fit=crop&w=1600&q=80")`,
          }}
          aria-hidden
        />
        <div className="vk-container vk-hero__immersive-grid">
          <div className="vk-hero__card vk-hero__card--immersive">
            <span className="vk-badge">AETERNA — skaitmeninė atmintis</span>
            <h1>
              Pasaulinis lietuvių atminimo tinklas. Išsaugokite savo šeimos istoriją skaitmeniniame metraštyje iš bet
              kurio pasaulio krašto.
            </h1>
            <p className="vk-hero__lead">
              Sukurkite amžiną skaitmeninį memorialą giminaičiui, pažymėkite kapavietę pasauliniame žemėlapyje, dalinkitės su
              artimaisiais ir remkite gimtąją parapiją nuotoliniu būdu. Jokių privalomų plokštelių ar siuntimo mokesčių.
            </p>
            <MemorialSearchBox />
            <ul className="vk-hero__list">
              <li>Memorialinis puslapis — nuotraukos, istorijos ir vieta žemėlapyje</li>
              <li>Nuskanavus — telefone atveriama visa skaitmeninė atmintis ir žvakutė</li>
            </ul>
            <div className="vk-hero__actions">
              <Link href="/wizard" className="vk-btn vk-btn--primary vk-btn--lg">
                Sukurti atmintį <span aria-hidden>→</span>
              </Link>
              <Link href={EXAMPLE} className="vk-btn vk-btn--outline vk-btn--lg">
                Kaip atrodo skaitmeninis atminimas
              </Link>
            </div>
          </div>
          <HomeHeroInteractive exampleQrUrl={exampleQrUrl} />
        </div>
        <HomeExplainerModal />
      </section>

      <AboutInitiative />

      <section className="vk-section vk-section--soft" id="video">
        <div className="vk-container vk-section--center">
          <span className="vk-badge">Vaizdo įrašas</span>
          <h2 className="vk-title">Atmintis, kuri lieka gyva kartoms</h2>
          <p className="vk-subtitle">
            Kodėl verta išsaugoti artimųjų istorijas skaitmeninėje erdvėje — ir kaip QR kodas ant kapo tai
            padaro pasiekiamą bet kur, bet kada.
          </p>
          <Link href={EXAMPLE} className="vk-video-card">
            <img
              src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80"
              alt=""
            />
            <span className="vk-video-card__play" aria-hidden>
              ▶
            </span>
            <span className="vk-video-card__label">Pamatyti gyvą pavyzdį</span>
          </Link>
        </div>
      </section>

      <section className="vk-section" id="kaip-veikia">
        <div className="vk-container">
          <span className="vk-badge vk-badge--center">Kaip veikia</span>
          <h2 className="vk-title vk-title--center">Kaip veikia AETERNA kapinėse ir telefone?</h2>
          <p className="vk-subtitle vk-subtitle--center">
            Paspauskite žingsnį — pamatysite, ką mato lankytojas telefone.
          </p>
          <HomeHowItWorksInteractive />
        </div>
      </section>

      <section className="vk-section vk-section--lavender vk-qr-band">
        <div className="vk-container vk-qr-band__inner">
          <div className="vk-qr-band__code">
            <img src={exampleQrUrl} alt="QR kodas memorialiniam puslapiui" width={200} height={200} />
            <p className="vk-qr-band__scan-hint">Nuskenuokite telefonu</p>
          </div>
          <div>
            <span className="vk-badge">Išbandykite patys</span>
            <h2 className="vk-title">
              Nuskenuokite QR kodą
              <br />
              <span className="vk-title__sub">arba apžiūrėkite metraštį naršyklėje</span>
            </h2>
            <ul className="vk-checklist">
              <li>Nuskenuokite QR kodą telefonu</li>
              <li>Peržiūrėkite močiutės Stasės memorialinį metraštį</li>
              <li>Registracija nebūtina — tai gyvas pavyzdys</li>
              <li>Nuotraukos, video, žvakutė ir navigacija iki kapo</li>
            </ul>
            <Link href={EXAMPLE} className="vk-btn vk-btn--primary">
              Apžiūrėti metraštį →
            </Link>
          </div>
        </div>
      </section>

      <section className="vk-section">
        <div className="vk-container">
          <span className="vk-badge vk-badge--center">Privalumai</span>
          <h2 className="vk-title vk-title--center">Kodėl verta rinktis AETERNA?</h2>
          <p className="vk-subtitle vk-subtitle--center">
            Skaitmeninė narystė pirmiausia — fizinė plokštelė tik jei jos norite:
          </p>
          <div className="vk-benefits vk-benefits--icons">
            {BENEFITS.map((b) => (
              <article key={b.title} className="vk-benefit-card">
                <span className="vk-benefit-card__icon" aria-hidden>
                  {b.icon}
                </span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="vk-section vk-section--soft">
        <div className="vk-container">
          <span className="vk-badge vk-badge--center">Žingsniai</span>
          <h2 className="vk-title vk-title--center">Kaip sukurti skaitmeninę atmintį?</h2>
          <p className="vk-subtitle vk-subtitle--center">
            Keturi žingsniai — nuo registracijos iki QR kodo ir pasidalinimo su artimaisiais:
          </p>
          <ol className="vk-steps-4">
            <li>
              <h3>1. Prisijunkite</h3>
              <p>
                <Link href="/prisijungti">El. paštas ir slaptažodis</Link> — saugi paskyra su redagavimu bet kada.
              </p>
            </li>
            <li>
              <h3>2. Sukurkite memorialą</h3>
              <p>Vardas, datos, nuotraukos ir vieta žemėlapyje — per kūrimo vedlį (39 € narystė).</p>
            </li>
            <li>
              <h3>3. Atsisiųskite QR PDF</h3>
              <p>Spausdinkite patys arba pasirinkite neprivalomą plokštelę į paštomatą (+25 €).</p>
            </li>
            <li>
              <h3>4. Pasidalinkite nuoroda</h3>
              <p>Lankytojai skenuoja arba atidaro nuorodą — prisiminimai visada pasiekiami telefone.</p>
            </li>
          </ol>
          <p className="vk-section__cta">
            <Link href="/wizard" className="vk-btn vk-btn--primary vk-btn--lg">
              Sukurti atmintį →
            </Link>
          </p>
        </div>
      </section>

      <section className="vk-section vk-final-cta">
        <div className="vk-container vk-section--center">
          <h2 className="vk-title">Pradėkite skaitmeninę atmintį jau šiandien</h2>
          <p className="vk-subtitle">
            Sukurkite memorialą savo artimajam — su QR kodu, nuotraukomis, žvakute ir parama parapijai.
          </p>
          <div className="vk-final-cta__actions">
            <Link href="/wizard" className="vk-btn vk-btn--white vk-btn--lg">
              Sukurti atmintį
            </Link>
            <DownloadAppButton variant="link" className="vk-final-cta__app" />
          </div>
        </div>
      </section>
    </>
  );
}
