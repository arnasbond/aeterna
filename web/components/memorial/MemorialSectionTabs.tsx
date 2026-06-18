"use client";

const TABS = [
  { id: "memorial-bio", label: "Atmintis" },
  { id: "memorial-gallery", label: "Nuotraukos" },
  { id: "memorial-candles", label: "Žvakutės" },
  { id: "memorial-guestbook", label: "Užuojauta" },
] as const;

type Props = {
  visible?: boolean;
};

export function MemorialSectionTabs({ visible = true }: Props) {
  if (!visible) return null;

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className="ch-memorial-tabs" aria-label="Memorialo skiltys">
      {TABS.map((tab) => (
        <button key={tab.id} type="button" className="ch-memorial-tabs__btn" onClick={() => scrollTo(tab.id)}>
          <span className="ch-memorial-tabs__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
