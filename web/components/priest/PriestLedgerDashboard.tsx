"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SupportInbox } from "@/components/support/SupportInbox";
import {
  acknowledgePriestMassSlotRequest,
  clearPriestToken,
  confirmPriestMass,
  createPriestMassSlot,
  fetchPriestDashboard,
  fetchPriestMassSlotRequests,
  fetchPriestMassSlotRequestsUnread,
  fetchPriestMasses,
  formatEuro,
  redirectToPriestLogin,
  type MassSlot,
  type MassSlotRequest,
  type PriestDashboard,
  validatePriestSession,
} from "@/lib/api";
import {
  alertPriestNewMassSlotRequest,
  ensurePriestNotifications,
} from "@/lib/priest-notify";

type Tab = "church" | "masses" | "intentions" | "finance";

const HOUR_OPTIONS = ["08:00", "10:00", "12:00", "18:00"] as const;

function formatMassWhen(dt: string) {
  return new Date(dt).toLocaleString("lt-LT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseDeceasedName(intentions: string | null, bookedBy: string | null): string {
  if (intentions) {
    const uz = intentions.match(/^Už\s+([^.,—\n]+)/i);
    if (uz) return uz[1].trim();
    const mel = intentions.match(/meldžiamės už\s+([^.,—\n]+)/i);
    if (mel) return mel[1].trim();
  }
  if (bookedBy?.trim()) return bookedBy.trim();
  return "Velionis";
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function nextSunday(from: Date) {
  const d = startOfDay(from);
  const day = d.getDay();
  const add = day === 0 ? 7 : 7 - day;
  d.setDate(d.getDate() + add);
  return d;
}

type DayChoice = "today" | "tomorrow" | "sunday" | "pick";

export function PriestLedgerDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("intentions");
  const [dash, setDash] = useState<PriestDashboard | null>(null);
  const [masses, setMasses] = useState<MassSlot[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const [dayChoice, setDayChoice] = useState<DayChoice>("today");
  const [pickDate, setPickDate] = useState("");
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [addingSlot, setAddingSlot] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState("10:00");
  const [slotRequests, setSlotRequests] = useState<MassSlotRequest[]>([]);
  const [slotRequestUnread, setSlotRequestUnread] = useState(0);
  const [ackBusyId, setAckBusyId] = useState<string | null>(null);
  const [notifyReady, setNotifyReady] = useState(false);
  const prevUnreadRef = useRef(-1);

  const refreshSlotRequests = useCallback(async () => {
    try {
      const [list, unread] = await Promise.all([
        fetchPriestMassSlotRequests(),
        fetchPriestMassSlotRequestsUnread(),
      ]);
      setSlotRequests(list);
      const count = unread.count;
      if (prevUnreadRef.current >= 0 && count > prevUnreadRef.current) {
        const newest = list[0];
        if (newest) {
          alertPriestNewMassSlotRequest(newest.requesterName, newest.message);
        }
      }
      prevUnreadRef.current = count;
      setSlotRequestUnread(count);
    } catch {
      /* ignore poll errors */
    }
  }, []);

  async function refresh() {
    const [d, m] = await Promise.all([fetchPriestDashboard(), fetchPriestMasses()]);
    setDash(d);
    setMasses(m);
    await refreshSlotRequests();
  }

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const ok = await validatePriestSession();
      if (cancelled) return;
      if (!ok) {
        redirectToPriestLogin();
        return;
      }
      try {
        await refresh();
        if (!cancelled) setBooting(false);
      } catch {
        if (!cancelled) {
          clearPriestToken();
          redirectToPriestLogin();
        }
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      setNotifyReady(true);
    }
  }, []);

  useEffect(() => {
    if (booting) return;
    const tick = () => {
      if (document.visibilityState === "visible") void refreshSlotRequests();
    };
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [booting, refreshSlotRequests]);

  async function acknowledgeRequest(id: string) {
    setAckBusyId(id);
    setErr(null);
    try {
      await acknowledgePriestMassSlotRequest(id);
      setMsg("✓ Prašymas pažymėtas — galite pridėti laikus žemiau.");
      await refreshSlotRequests();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko");
    } finally {
      setAckBusyId(null);
    }
  }

  function formatRequestWhen(iso: string) {
    return new Date(iso).toLocaleString("lt-LT", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const intentionsFeed = useMemo(
    () =>
      masses.filter((m) => m.status === "pending" || m.status === "confirmed"),
    [masses]
  );

  const openSlots = useMemo(
    () => masses.filter((m) => m.status === "open" && m.isAvailable),
    [masses]
  );

  function resolveDayDate(): Date | null {
    const now = new Date();
    if (dayChoice === "today") return startOfDay(now);
    if (dayChoice === "tomorrow") {
      const t = startOfDay(now);
      t.setDate(t.getDate() + 1);
      return t;
    }
    if (dayChoice === "sunday") return nextSunday(now);
    if (dayChoice === "pick" && pickDate) {
      const [y, mo, da] = pickDate.split("-").map(Number);
      if (!y || !mo || !da) return null;
      return new Date(y, mo - 1, da);
    }
    return null;
  }

  async function addMassAtHour(hour: string) {
    const day = resolveDayDate();
    if (!day) {
      setErr("Pirmiausia pasirinkite dieną.");
      return;
    }
    const [h, min] = hour.split(":").map(Number);
    const dt = new Date(day);
    dt.setHours(h, min ?? 0, 0, 0);
    if (dt.getTime() <= Date.now() - 60_000) {
      setErr("Pasirinktas laikas jau praėjo. Pasirinkite kitą dieną ar valandą.");
      return;
    }
    setAddingSlot(true);
    setErr(null);
    setMsg(null);
    setSelectedHour(hour);
    try {
      await createPriestMassSlot(dt.toISOString());
      setMsg(`✓ Pridėta: ${formatMassWhen(dt.toISOString())} — matoma tikintiesiems.`);
      setSelectedHour(null);
      setShowCustomTime(false);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko pridėti laiko");
      setSelectedHour(null);
    } finally {
      setAddingSlot(false);
    }
  }

  async function confirmIntention(id: string) {
    setConfirmingId(id);
    setErr(null);
    try {
      await confirmPriestMass(id);
      setMsg("✓ Įrašyta į liturgiją — šeima matys patvirtinimą.");
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko patvirtinti");
    } finally {
      setConfirmingId(null);
    }
  }

  function logout() {
    clearPriestToken();
    router.replace("/priest/login");
  }

  if (booting || !dash) {
    return (
      <div className="priest-ledger max-w-xl mx-auto px-4">
        <p className="pl-caption" style={{ textAlign: "center", padding: "2rem 0" }}>
          Kraunama…
        </p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "intentions", label: "📜 Užsakytos Mišių maldos (Intencijos)" },
    {
      id: "masses",
      label:
        slotRequestUnread > 0
          ? `📅 Šv. Mišių tvarkaraštis (${slotRequestUnread} nauja!)`
          : "📅 Šv. Mišių tvarkaraštis",
    },
    { id: "church", label: "⛪ Bažnyčios puslapio informacija" },
    { id: "finance", label: "💶 Parapijos aukos" },
  ];

  const dayButtons: { id: DayChoice; label: string }[] = [
    { id: "today", label: "Šiandien" },
    { id: "tomorrow", label: "Rytoj" },
    { id: "sunday", label: "Artimiausias sekmadienis" },
    { id: "pick", label: "Kita diena (pasirinkti datą)" },
  ];

  return (
    <div className="priest-ledger max-w-xl mx-auto px-4">
      <header className="pl-header">
        <div>
          <h1>Parapijos užrašų knygelė</h1>
          <p className="pl-caption">{dash.parish.title}</p>
        </div>
        <button type="button" className="pl-btn-exit" onClick={logout}>
          Išeiti
        </button>
      </header>

      <nav className="pl-tabs" aria-label="Skydo skiltys">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`pl-tab${tab === t.id ? " pl-tab--on" : ""}${
              t.id === "masses" && slotRequestUnread > 0 ? " pl-tab--alert" : ""
            }`}
            onClick={() => {
              setTab(t.id);
              setErr(null);
              setMsg(null);
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {typeof window !== "undefined" && "Notification" in window && !notifyReady && (
        <div className="pl-notify-setup pl-card">
          <p className="pl-caption" style={{ marginBottom: "0.65rem" }}>
            Įjunkite pranešimus telefone — garsas ir žinutė, kai kas prašo pridėti mišų laikų.
          </p>
          <button
            type="button"
            className="pl-confirm-mass"
            onClick={() => {
              void ensurePriestNotifications().then((ok) => setNotifyReady(ok));
            }}
          >
            🔔 Įjungti pranešimus
          </button>
        </div>
      )}

      {slotRequestUnread > 0 && (
        <div
          className="pl-mass-request-alert pl-card"
          role="alert"
          onClick={() => setTab("masses")}
          onKeyDown={(e) => e.key === "Enter" && setTab("masses")}
          tabIndex={0}
        >
          <strong>📣 {slotRequestUnread} prašymas pridėti mišų laikus</strong>
          <p className="pl-caption" style={{ margin: "0.35rem 0 0" }}>
            Paspauskite — atidarys tvarkaraštį. Pridėkite laikus, kad tikintieji galėtų užsakyti.
          </p>
        </div>
      )}

      {msg && <p className="pl-success pl-card">{msg}</p>}
      {err && <p className="pl-error pl-card">{err}</p>}

      {tab === "intentions" && (
        <section className="pl-card">
          <h2>📜 Užsakytos Mišių maldos (Intencijos)</h2>
          <p className="pl-caption" style={{ marginBottom: "1rem" }}>
            Kiekviena kortelė — viena šeimos užsakyta malda. Paspauskite žalią mygtuką, kai įtraukėte į
            liturgiją.
          </p>
          {intentionsFeed.length === 0 ? (
            <p className="pl-caption">Kol kas nėra užsakytų mišių. Kai kas užsakys — pamatysite čia.</p>
          ) : (
            intentionsFeed.map((m) => {
              const done = m.status === "confirmed";
              const name = parseDeceasedName(m.intentions, m.bookedBy ?? null);
              return (
                <article key={m.id} className="pl-intention-card">
                  <p className="pl-intention-card__name">{name}</p>
                  <span className="pl-intention-card__time">{formatMassWhen(m.dateTime)}</span>
                  {m.intentions && (
                    <p className="pl-intention-card__prayer">{m.intentions}</p>
                  )}
                  {m.bookedBy && (
                    <p className="pl-caption" style={{ marginBottom: "0.75rem" }}>
                      Užsakovas: {m.bookedBy}
                    </p>
                  )}
                  <button
                    type="button"
                    className={`pl-confirm-mass${done ? " pl-confirm-mass--done" : ""}`}
                    disabled={done || confirmingId === m.id}
                    onClick={() => void confirmIntention(m.id)}
                  >
                    {done
                      ? "✓ ĮTRAUKTA Į LITURGIJĄ"
                      : confirmingId === m.id
                        ? "Saugoma…"
                        : "✓ ĮTRAUKTA Į LITURGIJĄ"}
                  </button>
                </article>
              );
            })
          )}
        </section>
      )}

      {tab === "masses" && (
        <section className="pl-card">
          <h2>📅 Šv. Mišių tvarkaraštis</h2>
          <p className="pl-caption" style={{ marginBottom: "1rem" }}>
            1 žingsnis — pasirinkite dieną. 2 žingsnis — paspauskite valandą. Mišios iš karto
            atsiras tikintiesiems.
          </p>

          {slotRequests.length > 0 && (
            <div className="pl-mass-request-list">
              <h3>📣 Prašymai pridėti laikus</h3>
              {slotRequests.map((req) => (
                <article key={req.id} className="pl-mass-request-card">
                  <p className="pl-mass-request-card__who">
                    <strong>{req.requesterName}</strong>
                    <span className="pl-caption"> · {formatRequestWhen(req.createdAt)}</span>
                  </p>
                  <p className="pl-mass-request-card__msg">{req.message}</p>
                  <button
                    type="button"
                    className="pl-confirm-mass"
                    disabled={ackBusyId === req.id}
                    onClick={() => void acknowledgeRequest(req.id)}
                  >
                    {ackBusyId === req.id ? "…" : "✓ Supratau — pridėsiu laikus"}
                  </button>
                </article>
              ))}
            </div>
          )}

          <p className="pl-caption" style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
            1. Pasirinkite dieną
          </p>
          <ul className="pl-day-list">
            {dayButtons.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className={`pl-day-btn${dayChoice === d.id ? " pl-day-btn--on" : ""}`}
                  onClick={() => setDayChoice(d.id)}
                >
                  {d.label}
                </button>
              </li>
            ))}
          </ul>
          {dayChoice === "pick" && (
            <div className="pl-field" style={{ marginBottom: "1.25rem" }}>
              <label>Data</label>
              <input
                type="date"
                value={pickDate}
                onChange={(e) => setPickDate(e.target.value)}
                style={{ fontSize: "1.2rem" }}
              />
            </div>
          )}

          <p className="pl-caption" style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
            2. Pasirinkite valandą
          </p>
          <div className="pl-hour-pills">
            {HOUR_OPTIONS.map((h) => (
              <button
                key={h}
                type="button"
                className={`pl-hour-pill${selectedHour === h && addingSlot ? " pl-hour-pill--on" : ""}`}
                disabled={addingSlot}
                onClick={() => {
                  setShowCustomTime(false);
                  void addMassAtHour(h);
                }}
              >
                {h}
              </button>
            ))}
            <button
              type="button"
              className={`pl-hour-pill pl-hour-pill--other${showCustomTime ? " pl-hour-pill--on" : ""}`}
              disabled={addingSlot}
              onClick={() => {
                setShowCustomTime(true);
                setErr(null);
              }}
            >
              🕐 Kitas laikas
            </button>
          </div>

          {showCustomTime && (
            <div className="pl-custom-time">
              <p className="pl-caption" style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
                Pasirinkite laiką (valanda ir minutės)
              </p>
              <input
                type="time"
                className="pl-custom-time__input"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
              />
              <button
                type="button"
                className="pl-confirm-mass"
                style={{ marginTop: "0.75rem" }}
                disabled={addingSlot || !customTime}
                onClick={() => void addMassAtHour(customTime)}
              >
                {addingSlot ? "Pridedama…" : `✓ Pridėti ${customTime} mišias`}
              </button>
              <button
                type="button"
                className="pl-btn-exit"
                style={{ width: "100%", marginTop: "0.5rem" }}
                onClick={() => setShowCustomTime(false)}
              >
                Atgal į greitus laikus
              </button>
            </div>
          )}

          {openSlots.length > 0 && (
            <>
              <h3 style={{ marginTop: "1.5rem" }}>Jau atidaryti laikai</h3>
              <ul className="pl-day-list">
                {openSlots.map((m) => (
                  <li key={m.id}>
                    <span className="pl-day-btn" style={{ cursor: "default" }}>
                      {formatMassWhen(m.dateTime)} — laisva
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {tab === "church" && (
        <section className="pl-card">
          <h2>⛪ Bažnyčios puslapio informacija</h2>
          <p className="pl-caption" style={{ marginBottom: "1rem" }}>
            Čia redaguojate tai, ką mato žmonės parapijos puslapyje. Viskas didelėmis raidėmis — lengva
            skaityti telefone.
          </p>
          <Link href="/priest/profile" className="pl-tab pl-tab--on" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
            Atidaryti bažnyčios informacijos redagavimą →
          </Link>
        </section>
      )}

      {tab === "finance" && (
        <section className="pl-card">
          <h2>💶 Parapijos aukos</h2>
          <p className="pl-caption" style={{ marginBottom: "1rem" }}>
            Žvakučių ir Šv. Mišų aukos (be platformos aptarnavimo mokesčio 0,50 €). Skaitmeninės narystės mokesčiai
            neįtraukti — jie skirti platformai.
          </p>
          <div className="pl-card" style={{ marginBottom: "0.75rem" }}>
            <h3>Žvakutės</h3>
            <p className="pl-finance-value">{formatEuro(dash.finances.candlesTotalCents)}</p>
          </div>
          <div className="pl-card" style={{ marginBottom: "0.75rem" }}>
            <h3>Šv. Mišios</h3>
            <p className="pl-finance-value">{formatEuro(dash.finances.massesTotalCents)}</p>
          </div>
          <div className="pl-card">
            <h3>Iš viso</h3>
            <p className="pl-finance-value">{formatEuro(dash.finances.totalCents)}</p>
          </div>
        </section>
      )}

      <section className="pl-card">
        <h3 style={{ fontSize: "1.1rem" }}>📬 Žinutės su AETERNA</h3>
        <SupportInbox mode="priest" parishId={dash.parish.id} authorName={dash.parish.title} />
      </section>

      <p className="pl-link-row">
        <Link href="/">← Pradžia</Link>
      </p>
    </div>
  );
}
