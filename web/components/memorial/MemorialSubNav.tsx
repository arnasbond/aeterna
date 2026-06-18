"use client";

const SECTIONS = [
  { id: "memorial-bio", label: "Istorija" },
  { id: "memorial-gallery", label: "Nuotraukos" },
  { id: "memorial-mass", label: "Mišios" },
  { id: "memorial-guestbook", label: "Užuojauta" },
] as const;

type Props = {
  visible?: boolean;
};

export function MemorialSubNav({ visible = true }: Props) {
  if (!visible) return null;

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className="ch-memorial-subnav hidden lg:flex" aria-label="Memorialo skiltys">
      {SECTIONS.map((section) => (
        <button key={section.id} type="button" className="ch-memorial-subnav__link" onClick={() => scrollTo(section.id)}>
          {section.label}
        </button>
      ))}
    </nav>
  );
}
