"use client";

type Props = {
  urls: string[];
  onSelect: (url: string) => void;
  onViewAll?: () => void;
  title?: string;
};

export function MemorialGalleryStrip({
  urls,
  onSelect,
  onViewAll,
  title = "Atminčiai",
}: Props) {
  if (!urls.length) return null;
  const preview = urls.slice(0, 3);

  return (
    <section className="ch-memorial-gallery-strip" aria-label={title}>
      <div className="ch-memorial-gallery-strip__head">
        <h2 className="chronicle-serif ch-memorial-gallery-strip__title">{title}</h2>
        {urls.length > 3 && onViewAll ? (
          <button type="button" className="ch-memorial-gallery-strip__more" onClick={onViewAll}>
            Visos →
          </button>
        ) : null}
      </div>
      <div className="ch-memorial-gallery-strip__row">
        {preview.map((url, i) => (
          <button
            key={`${url}-${i}`}
            type="button"
            className="ch-memorial-gallery-strip__thumb"
            onClick={() => onSelect(url)}
            aria-label={`Nuotrauka ${i + 1}`}
          >
            <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" />
          </button>
        ))}
      </div>
    </section>
  );
}
