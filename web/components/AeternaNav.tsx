import Link from "next/link";

export function AeternaNav() {
  return (
    <nav className="ae-nav">
      <Link href="/" className="ae-logo">
        AETERNA
      </Link>
      <div className="ae-nav-links">
        <Link href="/map">Žemėlapis</Link>
        <Link href="/parishes">Parapijos</Link>
        <Link href="/#misios">Mišios</Link>
        <Link href="/#zvakute">Žvakutė</Link>
        <Link href="/admin/login" className="ae-nav-admin">
          Administratorius
        </Link>
      </div>
      <Link href="/priest/login" className="ae-btn ae-btn--gold ae-nav-klebonas">
        Klebonas
      </Link>
      <Link
        href="/wizard"
        className="ae-btn ae-btn--primary"
        style={{ fontSize: "0.8rem", padding: "0.5rem 1.25rem" }}
      >
        Sukurti atmintį
      </Link>
    </nav>
  );
}
