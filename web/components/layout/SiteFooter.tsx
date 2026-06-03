import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="vk-footer">
      <div className="vk-footer__grid">
        <div className="vk-footer__brand">
          <div className="vk-logo vk-logo--footer">
            <span className="vk-logo__mark" aria-hidden>
              ✝
            </span>
            <span className="vk-logo__text">
              <strong>AETERNA</strong>
              <small>Skaitmeninė atmintis šeimai</small>
            </span>
          </div>
          <p>QR kodas ant paminklo — amžina atmintis ir parama Jūsų parapijai.</p>
        </div>

        <div>
          <h3>Puslapiai</h3>
          <ul>
            <li>
              <Link href="/">Pagrindinis</Link>
            </li>
            <li>
              <Link href="/#kaip-veikia">Kaip veikia</Link>
            </li>
            <li>
              <Link href="/m/ona-demo">Pavyzdinis metraštis</Link>
            </li>
            <li>
              <Link href="/qr-ploksteles">Atminimo plokštelės</Link>
            </li>
            <li>
              <Link href="/#apie">Apie iniciatyvą</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3>Parapijos</h3>
          <ul>
            <li>
              <Link href="/map">Žemėlapis</Link>
            </li>
            <li>
              <Link href="/parishes">Visos parapijos</Link>
            </li>
            <li>
              <Link href="/#misios">Mišios</Link>
            </li>
            <li>
              <Link href="/#zvakute">Virtuali žvakutė</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3>Prisijungimai</h3>
          <ul>
            <li>
              <Link href="/prisijungti">Prisijungti / Registruotis</Link>
              <Link href="/paskyra">Mano paskyra</Link>
              <Link href="/priest/login">Parapijos administratoriaus prisijungimas</Link>
            </li>
            <li>
              <Link href="/admin/login">Administratorius</Link>
            </li>
            <li>
              <Link href="/atsisiusti">Android programėlė</Link>
            </li>
            <li>
              <Link href="/wizard">Sukurti atmintį</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="vk-footer__bottom">
        <p>© {new Date().getFullYear()} AETERNA — skaitmeninis atminimas ir parama parapijai</p>
      </div>
    </footer>
  );
}
