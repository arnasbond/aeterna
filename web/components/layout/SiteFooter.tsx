import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="vk-footer relative mt-8 border-t border-[#D4AF37]/15 bg-[#0A1A10]/95 text-white/85 backdrop-blur-md">
      <div className="vk-footer__grid">
        <div className="vk-footer__brand">
          <div className="vk-logo vk-logo--footer">
            <span className="vk-logo__mark !bg-gradient-to-br !from-[#D4AF37]/40 !to-[#0F2519]" aria-hidden>
              ✝
            </span>
            <span className="vk-logo__text font-serif">
              <strong className="tracking-[0.2em]">AETERNA</strong>
              <small>Skaitmeninė atmintis šeimai</small>
            </span>
          </div>
          <p className="text-white/70">
            QR kodas ant paminklo — amžina atmintis ir parama Jūsų parapijai.
          </p>
        </div>

        <div>
          <h3>Puslapiai</h3>
          <ul>
            <li>
              <Link href="/">Pagrindinis</Link>
            </li>
            <li>
              <Link href="/paieska">Ieškoti atminties</Link>
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
            </li>
            <li>
              <Link href="/paskyra">Mano paskyra</Link>
            </li>
            <li>
              <Link href="/priest/login">Parapijos administratoriaus prisijungimas</Link>
            </li>
            <li>
              <Link href="/admin/login">Administratorius</Link>
            </li>
            <li>
              <Link href="/atsisiusti">Android programėlė</Link>
            </li>
            <li>
              <Link href="/wizard">Sukurti memorialą</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="vk-footer__bottom">
        <p>© {new Date().getFullYear()} AETERNA · Parama parapijoms · Skaidrus aukų ataskaitavimas</p>
      </div>
    </footer>
  );
}
