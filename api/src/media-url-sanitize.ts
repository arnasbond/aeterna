const MAX_URL_LEN = 2048;

/** data: URL negali būti memorial JSON — per dideli ir dingsta po deploy. */
export function sanitizeMediaUrl(url: string | null | undefined): string | null {
  if (url == null) return null;
  const t = url.trim();
  if (!t) return null;
  if (t.startsWith("data:")) {
    throw new Error(
      "Nuotrauka neįkelta į serverį. Bandykite įkelti dar kartą arba naudokite mažesnį JPG failą."
    );
  }
  if (t.length > MAX_URL_LEN) {
    throw new Error("Medijos nuoroda per ilga — įkelkite failą iš naujo.");
  }
  if (!/^https?:\/\//i.test(t)) {
    throw new Error("Netinkama medijos nuoroda — įkelkite failą iš naujo.");
  }
  return t;
}

export function sanitizeMediaGallery(urls: string[] | undefined): string[] {
  if (!urls?.length) return [];
  return urls.map((u) => sanitizeMediaUrl(u)!).filter(Boolean);
}
