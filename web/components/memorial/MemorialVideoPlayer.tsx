"use client";

import { youtubeEmbedSrc } from "@/lib/video";

type Props = {
  videoUrl: string;
  fullName: string;
};

export function MemorialVideoPlayer({ videoUrl, fullName }: Props) {
  const embedSrc = youtubeEmbedSrc(videoUrl);

  return (
    <section className="ch-memorial-video" aria-labelledby="ch-memorial-video-heading">
      <h2 id="ch-memorial-video-heading" className="ch-memorial-video__title chronicle-serif">
        Atminimo vaizdo įrašas
      </h2>
      <div className="ch-memorial-video__wrap">
        {embedSrc ? (
          <iframe
            className="ch-memorial-video__iframe"
            src={embedSrc}
            title={`Atminimo filmas — Šviesios Atminties ${fullName}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <video
            className="ch-memorial-video__native"
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
          />
        )}
      </div>
      <p className="ch-memorial-video__hint">
        Galite valdyti vaizdo įrašą: sustabdyti, atsukti arba išskleisti per visą ekraną.
      </p>
    </section>
  );
}
