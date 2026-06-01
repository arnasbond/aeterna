import Link from "next/link";
import { DownloadAppButton } from "@/components/DownloadAppButton";
import { ShareBar } from "@/components/ShareBar";
import { getSiteOrigin } from "@/lib/site";

const DEMO_MEMORIAL_PATH = "/m/ona-demo";
const siteBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
const demoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&color=3d5636&bgcolor=fcfbf7&data=${encodeURIComponent(`${siteBase}${DEMO_MEMORIAL_PATH}`)}`;

export function HomeLanding() {
  return (
    <>
      <section className="ae-home-hero">
        <div className="ae-home-hero__bg" aria-hidden />
        <div className="ae-home-hero__inner">
          <div className="ae-home-hero__copy">
            <p className="ae-home-hero__eyebrow">Skaitmeninis atminimas · Parama parapijai</p>
            <h1>
              Viena akimirka prie paminklo —
              <span className="ae-home-hero__accent"> amžina atmintis</span> ir parama Bažnyčiai
            </h1>
            <p className="ae-home-hero__lead">
              AETERNA sujungia QR kodą ant paminklo, gražų memorialinį puslapį su nuotraukomis ir
              video bei tiesioginę paramą Jūsų pasirinktai parapijai.
            </p>
            <ul className="ae-home-hero__bullets">
            <li>
              <strong>
                <Link href="/qr-ploksteles">QR ant plokštelės</Link>
              </strong>{" "}
              — svečiai skenuoja ir atsiduria pasakojime
            </li>
              <li>
                <strong>Atmintis gyva</strong> — biografija, video, žvakutės, kelias į kapą
              </li>
              <li>
                <strong>20% parapijai</strong> — kiekvienas užsakymas remia Jūsų bendruomenę
              </li>
            </ul>
            <div className="ae-home-hero__actions">
              <Link href="/wizard" className="ae-btn ae-btn--primary ae-btn--lg">
                Sukurti atmintį
              </Link>
              <Link href={DEMO_MEMORIAL_PATH} className="ae-btn ae-btn--outline ae-btn--lg">
                Peržiūrėti demo
              </Link>
              <DownloadAppButton className="ae-home-hero__download" />
            </div>
            <ShareBar
              className="ae-home-hero__share"
              title="AETERNA — skaitmeninis atminimas"
              text="Viena akimirka prie paminklo — amžina atmintis ir parama parapijai."
              url={`${getSiteOrigin()}${DEMO_MEMORIAL_PATH}`}
            />
            <p className="ae-home-hero__trust">
              <Link href="/map">Parapijų žemėlapis</Link>
              <span aria-hidden> · </span>
              <Link href="/parishes">Rinktis parapiją</Link>
            </p>
          </div>

          <div className="ae-home-hero__visual" aria-hidden>
            <div className="ae-qr-scene">
              <div className="ae-qr-scene__glow" />
              <div className="ae-qr-monument">
                <div className="ae-qr-monument__stone" />
                <div className="ae-qr-plate">
                  <div className="ae-qr-plate__frame">
                    <img src={demoQrUrl} alt="" width={140} height={140} className="ae-qr-plate__img" />
                  </div>
                  <span className="ae-qr-plate__label">Skenuokite atmintį</span>
                </div>
              </div>
              <div className="ae-qr-arrow">
                <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
                  <path
                    d="M0 12h40m0 0l-8-8m8 8l-8 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="ae-phone-mock">
                <div className="ae-phone-mock__notch" />
                <div className="ae-phone-mock__screen">
                  <img
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80"
                    alt=""
                    className="ae-phone-mock__photo"
                  />
                  <p className="ae-phone-mock__name">Ona Kazlauskienė</p>
                  <p className="ae-phone-mock__dates">1942 — 2024</p>
                  <span className="ae-phone-mock__chip">Demo memorialas</span>
                </div>
              </div>
              <div className="ae-parish-chip">
                <span className="ae-parish-chip__icon">✝</span>
                <div>
                  <strong>Parama parapijai</strong>
                  <span>20% nuo užsakymo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ae-home-pillars">
        <div className="ae-home-pillars__grid">
          <Link href="/qr-ploksteles" className="ae-home-pillar ae-home-pillar--link">
            <div className="ae-home-pillar__icon ae-home-pillar__icon--qr">▣</div>
            <h2>QR ant paminklo</h2>
            <p>
              Metalinė ar keramikinė plokštelė su unikaliu kodu. Lankytojai telefonu atveria
              memorialinį puslapį — be sudėtingų programėlių.
            </p>
            <span className="ae-home-pillar__cta">3 plokštelių variantai ir kainos →</span>
          </Link>
          <article className="ae-home-pillar">
            <div className="ae-home-pillar__icon ae-home-pillar__icon--heart">♡</div>
            <h2>Atminimo kurimas</h2>
            <p>
              Nuotraukos, trumpas video, palinkėjimas palikuonims, virtuali žvakutė ir navigacija
              į kapavietę — viskas vienoje vietoje.
            </p>
          </article>
          <article className="ae-home-pillar">
            <div className="ae-home-pillar__icon ae-home-pillar__icon--church">⛪</div>
            <h2>Parama parapijai</h2>
            <p>
              Pasirenkate savo parapiją žemėlapyje. Dalis įmokos skiriama bažnyčios veiklos ir
              socialinei pagalbai.
            </p>
          </article>
        </div>
      </section>

      <section id="kaip-veikia" className="ae-section ae-section--white ae-home-flow">
        <h2 className="ae-section-title">Kelias nuo užsakymo iki amžinos atminties</h2>
        <div className="ae-divider" />
        <ol className="ae-home-timeline">
          <li className="ae-home-timeline__item">
            <span className="ae-home-timeline__num">1</span>
            <div>
              <h3>Kuriate memorialą</h3>
              <p>Wizard — vardas, datos, nuotraukos, parapija, pasakojimas.</p>
            </div>
          </li>
          <li className="ae-home-timeline__item">
            <span className="ae-home-timeline__num">2</span>
            <div>
              <h3>Gaukite QR kodą</h3>
              <p>
                <Link href="/qr-ploksteles">Pasirinkite plokštelę</Link> — paruošta montavimui ant
                paminklo.
              </p>
            </div>
          </li>
          <li className="ae-home-timeline__item">
            <span className="ae-home-timeline__num">3</span>
            <div>
              <h3>Žmonės skenuoja</h3>
              <p>Atidaromas puslapis su video, žinute ir žvakute.</p>
            </div>
          </li>
          <li className="ae-home-timeline__item">
            <span className="ae-home-timeline__num">4</span>
            <div>
              <h3>Parapija gauna paramą</h3>
              <p>Skaidrus paskirstymas — Jūsų bendruomenė stiprėja.</p>
            </div>
          </li>
        </ol>
        <p style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/wizard" className="ae-btn ae-btn--primary">
            Pradėti dabar
          </Link>
        </p>
      </section>

      <section className="ae-home-cta-band">
        <div className="ae-home-cta-band__inner">
          <div className="ae-home-cta-band__qr-mini">
            <img src={demoQrUrl} alt="" width={72} height={72} />
          </div>
          <div>
            <h2>Pamatykite, kaip tai atrodo gyvai</h2>
            <p>
              Demo profilis su video, nuotraukomis ir palinkėjimu — taip matys artimieji ir svečiai
              po QR skenavimo.
            </p>
            <Link href={DEMO_MEMORIAL_PATH} className="ae-btn ae-btn--gold">
              Atidaryti demo profilį →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
