import Link from "next/link";
import { DownloadAppButton } from "@/components/DownloadAppButton";

const DEMO = "/m/ona-demo";
const siteBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://aeterna-web-six.vercel.app";
const demoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&color=4a2f7a&bgcolor=ffffff&data=${encodeURIComponent(`${siteBase}${DEMO}`)}`;

const BENEFITS = [
  { title: "Memorialinis puslapis", text: "Nuotraukos, vaizdo įrašai ir gyvenimo istorijos" },
  { title: "Kapo vieta žemėlapyje", text: "Tikslus adresas ir maršrutas kapinėse" },
  { title: "QR kodas ant paminklo", text: "Metalinė plokštelė, atspari orui" },
  { title: "Nuskanavus QR", text: "Telefone atsidaro visa atmintis" },
  { title: "Virtuali žvakutė", text: "Žinutės ir pagerbimas artimiesiems" },
  { title: "Parama parapijai", text: "20% nuo užsakymo — Jūsų bendruomenei" },
] as const;

export function HomeLanding() {
  return (
    <>
      <section className="vk-hero">
        <div className="vk-hero__bg" aria-hidden />
        <div className="vk-container">
          <div className="vk-hero__card">
            <span className="vk-badge">Skaitmeninė atmintis šeimai</span>
            <h1>
              Virtuali kapavietė ir <span>QR kodas kapui</span>
            </h1>
            <p className="vk-hero__lead">
              Sukurkite vietą, kur artimųjų istorijos, nuotraukos ir prisiminimai išlieka pasiekiami visiems
              šeimos nariams. Sujunkite paminklą su skaitmenine atmintimi — vienu QR nuskaitymu kapinėse.
            </p>
            <ul className="vk-hero__list">
              <li>Virtuali atmintis — nuotraukos, istorijos ir kapo vieta žemėlapyje</li>
              <li>Memorialinė QR plokštelė ant paminklo — paruošta montavimui</li>
              <li>Nuskanavus kodą — atveriama visa memorialinė erdvė telefone</li>
            </ul>
            <div className="vk-hero__actions">
              <Link href="/wizard" className="vk-btn vk-btn--primary vk-btn--lg">
                Sukurti atmintį <span aria-hidden>→</span>
              </Link>
              <Link href={DEMO} className="vk-btn vk-btn--outline vk-btn--lg">
                Peržiūrėti demo
              </Link>
            </div>
          </div>
          <div className="vk-hero__visual" aria-hidden>
            <img
              src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80"
              alt=""
              className="vk-hero__photo"
            />
            <div className="vk-hero__qr">
              <img src={demoQrUrl} alt="" width={120} height={120} />
              <span>Skenuokite demo</span>
            </div>
          </div>
        </div>
      </section>

      <section className="vk-section vk-section--soft" id="video">
        <div className="vk-container vk-section--center">
          <span className="vk-badge">Vaizdo įrašas</span>
          <h2 className="vk-title">Prisiminimai, kurie lieka gyvi</h2>
          <p className="vk-subtitle">
            Memorialinis puslapis su video, nuotraukomis ir palinkėjimu — taip matys artimieji po QR
            skenavimo kapinėse.
          </p>
          <Link href={DEMO} className="vk-video-card">
            <img
              src="https://images.unsplash.com/photo-1758686253896-e6c76b6f7aa1?w=900&q=85"
              alt=""
            />
            <span className="vk-video-card__play" aria-hidden>
              ▶
            </span>
            <span className="vk-video-card__label">Peržiūrėti demo memorialą</span>
          </Link>
        </div>
      </section>

      <section className="vk-section" id="kaip-veikia">
        <div className="vk-container">
          <span className="vk-badge vk-badge--center">Kaip veikia</span>
          <h2 className="vk-title vk-title--center">Kaip veikia AETERNA kapinėse ir telefone?</h2>
          <div className="vk-steps-3">
            <article>
              <span className="vk-step-num">1</span>
              <h3>Nuskenuokite QR kodą</h3>
              <p>Kapinėse pakanka telefono — kodas ant paminklo akimirksniu atveria memorialinį puslapį.</p>
            </article>
            <article>
              <span className="vk-step-num">2</span>
              <h3>Atverkite istoriją</h3>
              <p>Viena skaitmeninė erdvė šeimai — nuotraukos, aprašymai ir vieta žemėlapyje.</p>
            </article>
            <article>
              <span className="vk-step-num">3</span>
              <h3>Prisiminkite kartu</h3>
              <p>Galerija, video, virtuali žvakutė ir parama pasirinktai parapijai.</p>
            </article>
          </div>
          <p className="vk-section__cta">
            <Link href={DEMO} className="vk-btn vk-btn--primary">
              Išbandykite dabar →
            </Link>
          </p>
        </div>
      </section>

      <section className="vk-section vk-section--lavender vk-qr-band">
        <div className="vk-container vk-qr-band__inner">
          <div className="vk-qr-band__code">
            <img src={demoQrUrl} alt="Demo QR kodas" width={200} height={200} />
          </div>
          <div>
            <span className="vk-badge">Išbandykite patys</span>
            <h2 className="vk-title">
              Nuskenuokite QR kodą
              <br />
              <span className="vk-title__sub">ir peržiūrėkite demo kapavietę</span>
            </h2>
            <ul className="vk-checklist">
              <li>Nuskenuokite QR kodą telefonu</li>
              <li>Peržiūrėkite pavyzdinę virtualią kapavietę</li>
              <li>Nereikia registracijos — tai demo profilis</li>
              <li>Pamatysite nuotraukas, video, žvakes ir navigaciją</li>
            </ul>
            <Link href={DEMO} className="vk-btn vk-btn--primary">
              Atidaryti demo kapavietę →
            </Link>
          </div>
        </div>
      </section>

      <section className="vk-section">
        <div className="vk-container">
          <span className="vk-badge vk-badge--center">Privalumai</span>
          <h2 className="vk-title vk-title--center">Kodėl verta rinktis AETERNA?</h2>
          <p className="vk-subtitle vk-subtitle--center">
            Viskas, ko reikia virtualiai atminties ir QR kodui kapui:
          </p>
          <div className="vk-benefits">
            {BENEFITS.map((b) => (
              <article key={b.title} className="vk-benefit-card">
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
          <h2 className="vk-title vk-title--center">Kaip sukurti atmintį ir gauti QR kodą?</h2>
          <ol className="vk-steps-4">
            <li>
              <h3>1. Prisiregistruokite nemokamai</h3>
              <p>
                <Link href="/prisijungti">El. paštas ir slaptažodis</Link> — apsaugota paskyra, kaip Virtualus
                Kapas.
              </p>
            </li>
            <li>
              <h3>2. Sukurkite memorialą</h3>
              <p>Vardas, datos, nuotraukos, video ir palinkėjimas — per kūrimo vedlys.</p>
            </li>
            <li>
              <h3>3. Užsisakykite QR plokštelę</h3>
              <p>
                <Link href="/qr-ploksteles">Pasirinkite variantą</Link> — paruošta montavimui ant paminklo.
              </p>
            </li>
            <li>
              <h3>4. Priklijuokite ant paminklo</h3>
              <p>Lankytojai skenuoja — prisiminimai visada pasiekiami telefone.</p>
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
          <h2 className="vk-title">Pradėkite virtualią atmintį jau šiandien</h2>
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
