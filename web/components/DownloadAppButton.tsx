"use client";

import { useEffect, useState } from "react";
import { getApkDownloadUrl, getAppDownloadPageUrl } from "@/lib/site";

type Props = {
  variant?: "button" | "link";
  className?: string;
  showHint?: boolean;
};

export function DownloadAppButton({ variant = "button", className = "", showHint = false }: Props) {
  const apkUrl = getApkDownloadUrl();
  const pageUrl = getAppDownloadPageUrl();
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    setInApp(typeof window !== "undefined" && !!window.AeternaApp?.downloadApp);
  }, []);

  const onClick = (e: React.MouseEvent) => {
    if (inApp && window.AeternaApp?.downloadApp) {
      e.preventDefault();
      window.AeternaApp.downloadApp();
    }
  };

  if (variant === "link") {
    return (
      <a href={pageUrl} className={`ae-download-app ae-download-app--link ${className}`.trim()}>
        Atsisiųsti programėlę
      </a>
    );
  }

  const label = inApp ? "Atsisiųsti APK failą" : "Atsisiųsti Android programėlę";

  return (
    <div className={`ae-download-app-wrap ${className}`.trim()}>
      <a
        href={inApp ? pageUrl : apkUrl}
        download={inApp ? undefined : "aeterna.apk"}
        target={inApp ? undefined : "_blank"}
        rel={inApp ? undefined : "noopener noreferrer"}
        className="ae-btn ae-btn--gold ae-download-app__btn"
        onClick={onClick}
      >
        {label}
      </a>
      {showHint && (
        <p className="ae-hint ae-download-app__hint">
          {inApp
            ? "Failas bus Atsisiuntimų aplanke. Jei reikia — leiskite įdiegti nežinomą programą."
            : "Reikia leisti įdiegti iš nežinomų šaltinių. "}
          {!inApp && (
            <>
              <a href={pageUrl}>Instrukcijos →</a>
            </>
          )}
        </p>
      )}
    </div>
  );
}
