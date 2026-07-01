import Link from "next/link";
import { QrPlateCatalog } from "@/components/qr/QrPlateCatalog";
import { HERCULES_REVEAL } from "@/lib/hercules-theme";

export const metadata = {
  title: "QR plokštelės ant paminklo | AETERNA",
  description: "Trys QR plokštelių variantai paminklui — standartinė, geresnė ir geriausia.",
};

export default function QrPlokstelesPage() {
  return (
    <div className={`hercules-page ${HERCULES_REVEAL}`}>
      <section className="ae-qr-catalog-hero">
        <div className="ae-qr-catalog-hero__inner">
          <Link href="/" className="ae-qr-catalog-back">
            ← Atgal
          </Link>
          <h1 className="hercules-page__title chronicle-serif">QR plokštelė ant paminklo</h1>
          <p className="ae-qr-catalog-hero__sub">
            Trys kokybės lygiai — vizualiai ir techniškai. Svečiai skenuoja kodą ir patenka į memorialinį puslapį su
            nuotraukomis, video ir palinkėjimu.
          </p>
        </div>
      </section>

      <div className="hercules-page__inner ae-qr-catalog-section">
        <QrPlateCatalog />
      </div>
    </div>
  );
}
