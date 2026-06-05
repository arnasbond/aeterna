"use client";

import Link from "next/link";
import { useState } from "react";
import {
  copyToClipboard,
  downloadQrPng,
  memorialProfileUrl,
  memorialQrImageUrl,
} from "@/lib/memorial-qr";

type Props = {
  slug: string;
  fullName: string;
  qrCodeUrl?: string | null;
  profileUrl?: string | null;
  /** Viešame profilyje — paspaudus QR atidaromas pilnas meniu */
  onExpand?: () => void;
  expandable?: boolean;
  /** Savininko / vedlio skiltis su plokštelėmis */
  showPlateLink?: boolean;
};

export function MemorialQrHub({
  slug,
  fullName,
  qrCodeUrl,
  profileUrl: storedProfileUrl,
  onExpand,
  expandable = false,
  showPlateLink = true,
}: Props) {
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const link = memorialProfileUrl(slug, storedProfileUrl);
  const qrDisplay = memorialQrImageUrl(slug, 280, qrCodeUrl);
  const qrPrint = memorialQrImageUrl(slug, 600, qrCodeUrl);
  async function flash(msg: string) {
    setCopyMsg(msg);
    setTimeout(() => setCopyMsg(null), 2200);
  }

  async function handleCopyLink() {
    if (await copyToClipboard(link)) await flash("Nuoroda nukopijuota");
    else await flash("Nepavyko kopijuoti — nukopijuokite ranka");
  }

  async function handleDownloadQr() {
    setBusy(true);
    try {
      await downloadQrPng(qrPrint, `aeterna-qr-${slug}.png`);
      await flash("QR atsisiųstas (600×600)");
    } catch {
      await flash("Atsisiuntimas nepavyko — atidarykite QR naujame lange");
      window.open(qrPrint, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  }

  function handleQrActivate() {
    if (expandable && onExpand) onExpand();
  }

  return (
    <section className="ch-memorial-qr-hub" aria-labelledby={`qr-hub-${slug}`}>
      <h2 id={`qr-hub-${slug}`} className="chronicle-serif ch-memorial-qr-hub__title">
        Atminties QR kodas
      </h2>
      <p className="ch-memorial-qr-hub__lead">
        {expandable
          ? "Skenuokite arba paspauskite QR — atsidarys pilnas profilis (žvakutės, Mišios, užuojautos)."
          : "Į plokštelę ar lentelę — atsisiųskite QR ir užsakykite gamybą."}
      </p>

      <div className="ch-memorial-qr-hub__card">
        {expandable ? (
          <button
            type="button"
            className="ch-memorial-qr-hub__qr-btn"
            onClick={handleQrActivate}
            aria-label={`Atidaryti pilną ${fullName} atmintį`}
          >
            <img src={qrDisplay} alt="" width={220} height={220} className="ch-memorial-qr-hub__qr" />
            <span className="ch-memorial-qr-hub__tap">Atidaryti pilną atmintį</span>
          </button>
        ) : (
          <img src={qrDisplay} alt="" width={220} height={220} className="ch-memorial-qr-hub__qr" />
        )}
        <p className="ch-memorial-qr-hub__name chronicle-serif">{fullName}</p>
      </div>

      <div className="ch-memorial-qr-hub__actions ch-btn-row">
        <button type="button" className="ch-btn ch-btn--outline" onClick={() => void handleCopyLink()}>
          Kopijuoti nuorodą
        </button>
        <button
          type="button"
          className="ch-btn ch-btn--primary"
          disabled={busy}
          onClick={() => void handleDownloadQr()}
        >
          {busy ? "Ruošiama…" : "Atsisiųsti QR (spaudai)"}
        </button>
      </div>

      {copyMsg && <p className="ch-memorial-qr-hub__flash">{copyMsg}</p>}

      <p className="ch-memorial-qr-hub__url">
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
        </a>
      </p>

      {showPlateLink && (
        <Link href={`/qr-ploksteles?slug=${encodeURIComponent(slug)}`} className="ch-btn ch-btn--gold ch-btn--block">
          QR plokštelės ir gamyba →
        </Link>
      )}
    </section>
  );
}
