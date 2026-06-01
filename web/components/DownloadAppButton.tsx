"use client";

import { getApkDownloadUrl, getAppDownloadPageUrl } from "@/lib/site";

type Props = {
  variant?: "button" | "link";
  className?: string;
  showHint?: boolean;
};

export function DownloadAppButton({ variant = "button", className = "", showHint = false }: Props) {
  const apkUrl = getApkDownloadUrl();
  const pageUrl = getAppDownloadPageUrl();

  const onDownload = () => {
    if (typeof window !== "undefined" && window.AeternaApp?.downloadApp) {
      window.AeternaApp.downloadApp();
      return;
    }
    window.location.href = apkUrl;
  };

  if (variant === "link") {
    return (
      <a href={pageUrl} className={`ae-download-app ae-download-app--link ${className}`.trim()}>
        Atsisiųsti programėlę
      </a>
    );
  }

  return (
    <div className={`ae-download-app-wrap ${className}`.trim()}>
      <button type="button" className="ae-btn ae-btn--gold ae-download-app__btn" onClick={onDownload}>
        Atsisiųsti Android programėlę
      </button>
      {showHint && (
        <p className="ae-hint ae-download-app__hint">
          Reikia leisti įdiegti iš nežinomų šaltinių.{" "}
          <a href={pageUrl}>Instrukcijos →</a>
        </p>
      )}
    </div>
  );
}
