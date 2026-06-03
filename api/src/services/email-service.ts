import { config } from "../config.js";

export async function sendPriestOtpEmail(to: string, code: string, parishTitle: string): Promise<boolean> {
  if (!config.resendApiKey) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.emailFrom,
      to: [to],
      subject: "AETERNA — parapijos administratoriaus prisijungimo kodas",
      html: `<p>Sveiki,</p>
<p>Jūsų vienkartinis prisijungimo kodas parapijai <strong>${parishTitle}</strong>:</p>
<p style="font-size:28px;font-weight:700;letter-spacing:0.2em">${code}</p>
<p>Kodas galioja 10 minučių.</p>
<p>Jei neprašėte kodo — ignoruokite šį laišką.</p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[email] Resend failed (${res.status}): ${text}`);
    return false;
  }
  return true;
}
