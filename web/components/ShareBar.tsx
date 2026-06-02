"use client";

import { useCallback, useMemo, useState } from "react";
import {
  buildSocialShareLinks,
  canNativeShare,
  copyToClipboard,
  nativeShare,
  type SharePayload,
} from "@/lib/share";

type Props = {
  url?: string;
  title: string;
  text?: string;
  className?: string;
};

export function ShareBar({ url: urlProp, title, text: textProp, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const payload = useMemo<SharePayload>(() => {
    const url =
      urlProp?.trim() ||
      (typeof window !== "undefined" ? window.location.href : "");
    const text =
      textProp?.trim() ||
      `Amžina atmintis — ${title}. Peržiūrėkite AETERNA memorialinį puslapį.`;
    return { url, title, text };
  }, [urlProp, title, textProp]);

  const social = useMemo(() => buildSocialShareLinks(payload), [payload]);
  const inAndroidApp = typeof window !== "undefined" && !!window.AeternaApp;

  const shareNative = useCallback(async () => {
    if (inAndroidApp && window.AeternaApp) {
      window.AeternaApp.sharePage(payload.title, payload.text);
      setStatus("Atidaromas dalinimasis…");
      return;
    }
    if (canNativeShare()) {
      const r = await nativeShare(payload);
      if (r === "shared") setStatus("Pasidalyta!");
      else if (r === "cancelled") setStatus(null);
      else setOpen(true);
      return;
    }
    setOpen((v) => !v);
  }, [inAndroidApp, payload]);

  const copyLink = useCallback(async () => {
    const ok = await copyToClipboard(payload.url);
    setCopied(ok);
    setStatus(ok ? "Nuoroda nukopijuota" : "Nepavyko kopijuoti");
    if (ok) setTimeout(() => setCopied(false), 2500);
  }, [payload.url]);

  return (
    <div className={`ae-share ${className}`.trim()} role="group" aria-label="Dalintis">
      <div className="ae-share__primary">
        <button type="button" className="ae-btn ae-btn--outline ae-share__btn" onClick={shareNative}>
          Dalintis
        </button>
        <button
          type="button"
          className="ae-btn ae-btn--ghost ae-share__btn ae-share__btn--copy"
          onClick={copyLink}
          aria-label="Kopijuoti nuorodą"
        >
          {copied ? "Nukopijuota" : "Kopijuoti nuorodą"}
        </button>
      </div>

      {status && (
        <p className="ae-share__status" role="status">
          {status}
        </p>
      )}

      {open && (
        <div className="ae-share__social ae-share__social--open">
          <p className="ae-share__hint">Pasirinkite tinklą:</p>
          <ul className="ae-share__list">
            {social.map((s) => (
              <li key={s.id}>
                <a
                  href={s.href}
                  className={`ae-share__chip ae-share__chip--${s.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setStatus(`Atidaroma: ${s.label}`)}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!open && canNativeShare() && !inAndroidApp && (
        <button type="button" className="ae-share__more" onClick={() => setOpen(true)}>
          Daugiau tinklų…
        </button>
      )}
    </div>
  );
}
