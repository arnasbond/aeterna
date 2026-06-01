import type { ReactNode } from "react";
import type { ParishDetail } from "@/lib/api";

type Props = {
  parish: ParishDetail;
};

function Block({ title, children }: { title: string; children: ReactNode }) {
  if (!children || (typeof children === "string" && !children.trim())) return null;
  return (
    <article className="ae-parish-profile-block">
      <h3>{title}</h3>
      <div className="ae-parish-profile-block__body">{children}</div>
    </article>
  );
}

function TextBlock({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <>
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

export function parishHeroImage(parish: ParishDetail): string {
  const fromGallery = parish.profile.galleryUrls.find((u) => isDisplayableImage(u));
  return fromGallery || parish.image;
}

function isDisplayableImage(url: string): boolean {
  const s = url.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  if (/facebook\.|instagram\.|twitter\.|youtube\.|linkedin\.|favicon|icon|\.gif(\?|$)/i.test(s)) return false;
  try {
    const u = new URL(s);
    if (!u.pathname || u.pathname === "/" || u.pathname.length < 4) return false;
  } catch {
    return false;
  }
  return true;
}

export function parishGalleryImages(parish: ParishDetail): string[] {
  const fromProfile = parish.profile.galleryUrls.filter(isDisplayableImage);
  if (fromProfile.length > 0) return fromProfile;
  if (parish.image) return [parish.image];
  return [];
}

export function ParishProfilePublic({ parish }: Props) {
  const p = parish.profile;
  const gallery = parishGalleryImages(parish);
  const hasContent =
    p.shortDescription ||
    p.about ||
    p.address ||
    p.phone ||
    p.email ||
    p.priestName ||
    p.massSchedule ||
    p.confessionTimes ||
    p.officeHours ||
    p.sacraments ||
    p.announcements ||
    p.bankDetails ||
    gallery.length > 0 ||
    p.extraSections.length > 0;

  if (!hasContent) {
    return (
      <p className="ae-hint" style={{ textAlign: "center" }}>
        Klebonas dar nepildė išsamios parapijos informacijos. Oficiali svetainė — nuoroda aukščiau.
      </p>
    );
  }

  return (
    <div className="ae-parish-profile">
      {p.shortDescription && <p className="ae-parish-profile__lead">{p.shortDescription}</p>}

      {gallery.length > 0 && (
        <section className="ae-parish-gallery" aria-label="Parapijos nuotraukos">
          <h3 className="ae-parish-gallery__title">Nuotraukos</h3>
          <div className="ae-parish-gallery__grid">
            {gallery.map((src) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noreferrer"
                className="ae-parish-gallery__item"
              >
                <img src={src} alt="" loading="lazy" />
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="ae-parish-profile__grid">
        <Block title="Apie parapiją">
          <TextBlock text={p.about} />
        </Block>

        <Block title="Kontaktai">
          {p.priestName && (
            <p>
              <strong>Klebonas:</strong> {p.priestName}
            </p>
          )}
          {p.deputyPriestName && (
            <p>
              <strong>Vikaras:</strong> {p.deputyPriestName}
            </p>
          )}
          {p.address && <p>{p.address}</p>}
          {p.phone && (
            <p>
              <a href={`tel:${p.phone.replace(/\s/g, "")}`}>{p.phone}</a>
            </p>
          )}
          {p.email && (
            <p>
              <a href={`mailto:${p.email}`}>{p.email}</a>
            </p>
          )}
          {p.officeHours && (
            <>
              <p>
                <strong>Darbo laikas</strong>
              </p>
              <TextBlock text={p.officeHours} />
            </>
          )}
        </Block>

        <Block title="Šv. Mišios">
          <TextBlock text={p.massSchedule} />
        </Block>

        <Block title="Išpažintis">
          <TextBlock text={p.confessionTimes} />
        </Block>

        <Block title="Sakramentai ir katechezė">
          <TextBlock text={p.sacraments} />
        </Block>

        <Block title="Naujienos ir skelbimai">
          <TextBlock text={p.announcements} />
        </Block>

        <Block title="Parama ir rekvizitai">
          <TextBlock text={p.bankDetails || `${parish.supportGoal}\n${parish.bankAccount}`} />
        </Block>
      </div>

      {p.extraSections.map((s) => (
        <Block key={s.title} title={s.title}>
          <TextBlock text={s.body} />
        </Block>
      ))}

      {p.importedAt && (
        <p className="ae-hint ae-parish-profile__meta">
          Profilis atnaujintas: {new Date(p.updatedAt).toLocaleString("lt-LT")}
          {p.importedFrom && (
            <>
              {" "}
              · Duomenys iš{" "}
              <a href={p.importedFrom} target="_blank" rel="noreferrer">
                oficialios svetainės
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}
