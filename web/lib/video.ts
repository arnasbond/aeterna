/** Extract YouTube video ID for embed, or null if not YouTube. */
export function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtube-nocookie.com")) {
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.split("/")[2] ?? null;
      }
      const v = u.searchParams.get("v");
      if (v) return v;
      if (u.pathname.startsWith("/shorts/")) {
        return u.pathname.split("/")[2] ?? null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeEmbedSrc(url: string): string | null {
  const id = youtubeVideoId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?controls=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
}
