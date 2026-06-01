"use client";

import Link from "next/link";
import { useState } from "react";
import { QrPlateVisual } from "@/components/qr/QrPlateVisual";
import {
  formatPrice,
  MEMORIAL_PACKAGE_CENTS,
  PLATE_TIERS,
  packageTotalCents,
  type PlateTierId,
} from "@/lib/qr-plates";

const DEMO_QR =
  "https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=6&color=3d5636&bgcolor=ffffff&data=https%3A%2F%2Faeterna.lt";

type Props = {
  preselectedParish?: string;
};

export function QrPlateCatalog({ preselectedParish }: Props) {
  const [selected, setSelected] = useState<PlateTierId | null>(null);
  const total = packageTotalCents(selected);

  const wizardHref =
    selected != null
      ? `/wizard?plate=${selected}${preselectedParish ? `&parish=${encodeURIComponent(preselectedParish)}` : ""}`
      : "/wizard";

  return (
    <>
      <p className="ae-qr-catalog-lead">
        Pasirinkite plokštelės medžiagą ir kokybę. Kartu su skaitmeniniu memorialu (149 €) — vienas
        užsakymas, unikalus QR kodas, paruoštas montavimui ant paminklo.
      </p>

      <div className="ae-qr-catalog-grid">
        {PLATE_TIERS.map((tier) => {
          const isOn = selected === tier.id;
          return (
            <article
              key={tier.id}
              className={`ae-qr-offer${isOn ? " ae-qr-offer--selected" : ""}${tier.popular ? " ae-qr-offer--popular" : ""}`}
            >
              {tier.popular && <span className="ae-qr-offer__badge">Dažniausiai renkama</span>}
              <header className="ae-qr-offer__head">
                <h2>{tier.name}</h2>
                <p className="ae-qr-offer__tagline">{tier.tagline}</p>
              </header>

              <QrPlateVisual variant={tier.variant} qrSrc={DEMO_QR} />

              <dl className="ae-qr-offer__specs">
                <div>
                  <dt>Medžiaga</dt>
                  <dd>{tier.material}</dd>
                </div>
                <div>
                  <dt>Matmenys</dt>
                  <dd>{tier.size}</dd>
                </div>
                <div>
                  <dt>Apdaila</dt>
                  <dd>{tier.finish}</dd>
                </div>
              </dl>

              <ul className="ae-qr-offer__features">
                {tier.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              <div className="ae-qr-offer__price">
                <span className="ae-qr-offer__price-label">Plokštelė</span>
                <span className="ae-qr-offer__price-value">{formatPrice(tier.priceCents)}</span>
                <span className="ae-qr-offer__price-note">
                  + memorialas {formatPrice(MEMORIAL_PACKAGE_CENTS)}
                </span>
              </div>

              <button
                type="button"
                className={`ae-btn ae-btn--wide${isOn ? " ae-btn--primary" : " ae-btn--outline"}`}
                onClick={() => setSelected(tier.id)}
              >
                {isOn ? "Pasirinkta" : "Rinktis šį variantą"}
              </button>
            </article>
          );
        })}
      </div>

      <aside className="ae-qr-catalog-summary">
        <h3>Jūsų pasirinkimas</h3>
        {selected ? (
          <>
            <p>
              <strong>{PLATE_TIERS.find((t) => t.id === selected)?.name}</strong> plokštelė +{" "}
              skaitmeninis memorialas
            </p>
            <p className="ae-qr-catalog-summary__total">
              Iš viso: <strong>{formatPrice(total)}</strong>
            </p>
            <p className="ae-hint">20% sumos skiriama pasirinktai parapijai</p>
            <Link href={wizardHref} className="ae-btn ae-btn--gold ae-btn--wide">
              Tęsti — sukurti atmintį ir užsakyti
            </Link>
          </>
        ) : (
          <p className="ae-hint">Pasirinkite vieną iš trijų plokštelių variantų aukščiau.</p>
        )}
        <Link href="/wizard" className="ae-btn ae-btn--outline ae-btn--wide" style={{ marginTop: "0.5rem" }}>
          Tik memorialas be plokštelės (149 €)
        </Link>
      </aside>
    </>
  );
}
