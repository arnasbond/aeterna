import { memorialQrImageUrl, memorialProfileUrl } from "@/lib/memorial-qr";

type DownloadQrPdfInput = {
  slug: string;
  fullName: string;
  qrCodeUrl?: string | null;
  profileUrl?: string | null;
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Nepavyko nuskaityti QR vaizdo"));
    reader.readAsDataURL(blob);
  });
}

/** Atsisiunčia aukštos kokybės QR (PDF). */
export async function downloadQrPdf({ slug, fullName, qrCodeUrl, profileUrl }: DownloadQrPdfInput) {
  // jsPDF veikia tik browser runtime.
  const mod = await import("jspdf");
  const jsPDF = mod.default as unknown as new (options: any) => any;

  const effectiveProfileUrl = profileUrl ? memorialProfileUrl(slug, profileUrl) : memorialProfileUrl(slug, null);
  const qrImgUrl = memorialQrImageUrl(slug, 1100, qrCodeUrl ?? null);

  const res = await fetch(qrImgUrl);
  if (!res.ok) throw new Error("Nepavyko atsisiųsti QR vaizdo PDF generavimui");
  const blob = await res.blob();
  const imgDataUrl = await blobToDataUrl(blob);

  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // UI paprastumas: QR centre + link apačioje.
  const title = "AETERNA — atminties QR";
  const caption = fullName?.trim() || slug;
  const qrSize = 240; // pt (pakankamai ryšku)
  const qrX = (pageW - qrSize) / 2;
  const qrY = 110;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(title, pageW / 2, 55, { align: "center" });
  doc.setFontSize(11);
  doc.text(caption, pageW / 2, 78, { align: "center" });

  // addImage: duomenys pateikiami kaip PNG dataURL (jsPDF automatiškai aptinka formatą).
  doc.addImage(imgDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  doc.setFontSize(10);
  doc.text(effectiveProfileUrl, pageW / 2, qrY + qrSize + 25, { align: "center" });

  // Papildoma eilutė apačioje (vizualinis balansavimas).
  if (pageH > qrY + qrSize + 60) {
    doc.setFontSize(8);
    doc.text("Sukurtas skaitmeniniam memorialui", pageW / 2, pageH - 28, { align: "center" });
  }

  doc.save(`aeterna-qr-${slug}.pdf`);
}

