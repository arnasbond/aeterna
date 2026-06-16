import "../hercules-memorial.css";

/** Visi /m/* memorialai — vienas tamsus Hercules shell + stiliai */
export default function MemorialRoutesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hercules-memorial-page">
      <div className="hercules-header-spacer" aria-hidden />
      {children}
    </div>
  );
}
