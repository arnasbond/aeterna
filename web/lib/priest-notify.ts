/** Garsinis ir sisteminis pranešimas kunigui (skydelis atidarytas arba PWA telefone). */

export function playPriestAlertSound() {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration + 0.05);
    };
    playTone(880, 0, 0.18);
    playTone(1174.66, 0.22, 0.22);
    window.setTimeout(() => void ctx.close(), 800);
  } catch {
    /* ignore */
  }
}

export async function ensurePriestNotifications(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function showPriestMassRequestNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const n = new Notification(title, {
      body,
      tag: "aeterna-mass-slot-request",
      requireInteraction: true,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    /* ignore */
  }
}

export function alertPriestNewMassSlotRequest(requesterName: string, message: string) {
  playPriestAlertSound();
  showPriestMassRequestNotification(
    "📣 Prašymas pridėti mišų laikus",
    `${requesterName}: ${message.slice(0, 120)}${message.length > 120 ? "…" : ""}`
  );
}
