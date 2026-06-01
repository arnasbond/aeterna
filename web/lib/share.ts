export type SharePayload = {
  url: string;
  title: string;
  text: string;
};

export type SocialShareLink = {
  id: string;
  label: string;
  href: string;
};

function enc(s: string): string {
  return encodeURIComponent(s);
}

/** Nuorodos į populiarius dalinimosi kanalus (atidaroma naujame lange). */
export function buildSocialShareLinks({ url, title, text }: SharePayload): SocialShareLink[] {
  const line = text ? `${text}\n${url}` : url;
  return [
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(line)}`,
    },
    {
      id: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text || title)}`,
    },
    {
      id: "viber",
      label: "Viber",
      href: `viber://forward?text=${enc(line)}`,
    },
    {
      id: "email",
      label: "El. paštas",
      href: `mailto:?subject=${enc(title)}&body=${enc(line)}`,
    },
    {
      id: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(text || title)}`,
    },
  ];
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fallback */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function nativeShare(payload: SharePayload): Promise<"shared" | "cancelled" | "unsupported"> {
  if (!canNativeShare()) return "unsupported";
  try {
    await navigator.share({
      title: payload.title,
      text: payload.text,
      url: payload.url,
    });
    return "shared";
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
    return "unsupported";
  }
}
