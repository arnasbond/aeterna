"use client";

type Props = {
  urls: string[];
  onSelect: (url: string) => void;
};

/** Staggered photo album — breaks uniform tile fatigue on mobile */
function masonryItemClass(index: number): string {
  const mod = index % 6;
  if (mod === 0) return "ch-memorial-masonry__item ch-memorial-masonry__item--wide";
  if (mod === 2 || mod === 5) return "ch-memorial-masonry__item ch-memorial-masonry__item--tall";
  return "ch-memorial-masonry__item ch-memorial-masonry__item--square";
}

export function MemorialGalleryMasonry({ urls, onSelect }: Props) {
  if (!urls.length) return null;

  return (
    <div className="ch-memorial-masonry" role="list">
      {urls.map((url, i) => (
        <button
          key={`${url}-${i}`}
          type="button"
          role="listitem"
          className={masonryItemClass(i)}
          onClick={() => onSelect(url)}
          aria-label={`Atidaryti nuotrauką ${i + 1}`}
        >
          <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" />
        </button>
      ))}
    </div>
  );
}
