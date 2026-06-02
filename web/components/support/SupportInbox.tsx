"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAdminSupportThread,
  createPriestSupportThread,
  fetchAdminSupportThread,
  fetchAdminSupportThreads,
  fetchAdminSupportUnread,
  fetchParishes,
  fetchPriestSupportThread,
  fetchPriestSupportThreads,
  fetchPriestSupportUnread,
  postAdminSupportMessage,
  postPriestSupportMessage,
  updateAdminSupportThreadStatus,
  type Parish,
  type SupportCategory,
  type SupportMessage,
  type SupportStatus,
  type SupportThread,
  type SupportThreadDetail,
} from "@/lib/api";

const CATEGORY_LABELS: Record<SupportCategory, string> = {
  problem: "Nesklandumas",
  fix: "Pataisymas",
  request: "Pageidavimas",
  other: "Kita",
};

const STATUS_LABELS: Record<SupportStatus, string> = {
  open: "Nauja",
  in_progress: "Sprendžiama",
  resolved: "Išspręsta",
};

function formatDt(iso: string) {
  return new Date(iso).toLocaleString("lt-LT", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  mode: "priest" | "admin";
  parishId?: string;
  authorName?: string;
};

export function SupportInbox({ mode, parishId, authorName }: Props) {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [unread, setUnread] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SupportThreadDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState<SupportCategory>("problem");
  const [newBody, setNewBody] = useState("");
  const [replyBody, setReplyBody] = useState("");

  const [parishes, setParishes] = useState<Parish[]>([]);
  const [newParishId, setNewParishId] = useState(parishId ?? "");

  const loadThreads = useCallback(async () => {
    if (mode === "priest") {
      const [list, u] = await Promise.all([fetchPriestSupportThreads(), fetchPriestSupportUnread()]);
      setThreads(list);
      setUnread(u.count);
    } else {
      const [list, u] = await Promise.all([fetchAdminSupportThreads(), fetchAdminSupportUnread()]);
      setThreads(list);
      setUnread(u.count);
    }
  }, [mode]);

  const loadThread = useCallback(
    async (id: string) => {
      const data =
        mode === "priest" ? await fetchPriestSupportThread(id) : await fetchAdminSupportThread(id);
      setDetail(data);
      setActiveId(id);
      await loadThreads();
    },
    [mode, loadThreads]
  );

  useEffect(() => {
    loadThreads().catch((e) => setErr(e instanceof Error ? e.message : "Nepavyko įkelti"));
    if (mode === "admin") {
      fetchParishes().then((p) => {
        setParishes(p);
        setNewParishId((prev) => prev || p[0]?.id || "");
      });
    }
  }, [loadThreads, mode]);

  async function submitNewThread(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const data =
        mode === "priest"
          ? await createPriestSupportThread({
              subject: newSubject,
              category: newCategory,
              body: newBody,
              authorName,
            })
          : await createAdminSupportThread({
              parishId: newParishId,
              subject: newSubject,
              category: newCategory,
              body: newBody,
            });
      setShowNew(false);
      setNewSubject("");
      setNewBody("");
      setDetail(data);
      setActiveId(data.thread.id);
      await loadThreads();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko išsiųsti");
    } finally {
      setBusy(false);
    }
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !replyBody.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const data =
        mode === "priest"
          ? await postPriestSupportMessage(activeId, replyBody, authorName)
          : await postAdminSupportMessage(activeId, replyBody);
      setReplyBody("");
      setDetail(data);
      await loadThreads();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko išsiųsti");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: SupportStatus) {
    if (!activeId || mode !== "admin") return;
    setBusy(true);
    try {
      const thread = await updateAdminSupportThreadStatus(activeId, status);
      setDetail((d) => (d ? { ...d, thread } : d));
      await loadThreads();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Nepavyko atnaujinti");
    } finally {
      setBusy(false);
    }
  }

  const unreadForThread = (t: SupportThread) => (mode === "priest" ? t.priestUnread : t.adminUnread);

  return (
    <div className="ae-support">
      <div className="ae-support__head">
        <div>
          <h3>Žinutės ir pranešimai</h3>
          <p className="ae-hint">
            {mode === "priest"
              ? "Rašykite AETERNA administratoriui apie nesklandumus, pataisymus ir pageidavimus."
              : "Bendraukite su parapijų administratoriais — greičiau išspręsite problemas."}
          </p>
        </div>
        {unread > 0 && <span className="ae-support__badge">{unread} nauja</span>}
        <button type="button" className="ae-btn ae-btn--gold" onClick={() => setShowNew((v) => !v)}>
          {showNew ? "Atšaukti" : "+ Naujas pranešimas"}
        </button>
      </div>

      {err && <p className="ae-error">{err}</p>}

      {showNew && (
        <form className="ae-card ae-support__new" onSubmit={submitNewThread}>
          <h4>Naujas pranešimas</h4>
          {mode === "admin" && (
            <div className="ae-field">
              <label>Parapija</label>
              <select value={newParishId} onChange={(e) => setNewParishId(e.target.value)} required>
                {parishes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="ae-field-row">
            <div className="ae-field">
              <label>Kategorija</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as SupportCategory)}
              >
                {(Object.keys(CATEGORY_LABELS) as SupportCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="ae-field">
            <label>Tema</label>
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Pvz. Negaliu įkelti nuotraukų"
              required
            />
          </div>
          <div className="ae-field">
            <label>Žinutė</label>
            <textarea
              rows={4}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Aprašykite problemą, pageidavimą ar ką reikia pataisyti…"
              required
            />
          </div>
          <button type="submit" className="ae-btn ae-btn--primary" disabled={busy}>
            {busy ? "Siunčiama…" : "Siųsti pranešimą"}
          </button>
        </form>
      )}

      <div className="ae-support__layout">
        <aside className={`ae-support__list${activeId ? " ae-support__list--narrow" : ""}`}>
          {threads.length === 0 ? (
            <p className="ae-hint" style={{ padding: "1rem" }}>
              Dar nėra pranešimų. Sukurkite naują — apie problemą ar pageidavimą.
            </p>
          ) : (
            <ul>
              {threads.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={`ae-support__thread-btn${activeId === t.id ? " ae-support__thread-btn--active" : ""}`}
                    onClick={() => loadThread(t.id)}
                  >
                    <span className="ae-support__thread-top">
                      <strong>{t.subject}</strong>
                      {unreadForThread(t) > 0 && (
                        <span className="ae-support__dot">{unreadForThread(t)}</span>
                      )}
                    </span>
                    <span className="ae-support__thread-meta">
                      {CATEGORY_LABELS[t.category]} · {STATUS_LABELS[t.status]}
                      {mode === "admin" && ` · ${t.parishTitle}`}
                    </span>
                    <span className="ae-support__thread-date">{formatDt(t.updatedAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="ae-support__chat">
          {!detail ? (
            <p className="ae-hint ae-support__placeholder">Pasirinkite pokalbį arba sukurkite naują pranešimą.</p>
          ) : (
            <>
              <div className="ae-support__chat-head">
                <div>
                  <h4>{detail.thread.subject}</h4>
                  <p className="ae-hint">
                    {CATEGORY_LABELS[detail.thread.category]}
                    {mode === "admin" && ` · ${detail.thread.parishTitle}`}
                  </p>
                </div>
                {mode === "admin" ? (
                  <select
                    className="ae-support__status-select"
                    value={detail.thread.status}
                    onChange={(e) => changeStatus(e.target.value as SupportStatus)}
                    disabled={busy}
                  >
                    {(Object.keys(STATUS_LABELS) as SupportStatus[]).map((k) => (
                      <option key={k} value={k}>
                        {STATUS_LABELS[k]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`ae-status ae-status--${detail.thread.status === "resolved" ? "confirmed" : "pending"}`}>
                    {STATUS_LABELS[detail.thread.status]}
                  </span>
                )}
                {activeId && (
                  <button
                    type="button"
                    className="ae-support__back-mobile ae-btn ae-btn--outline"
                    onClick={() => {
                      setActiveId(null);
                      setDetail(null);
                    }}
                  >
                    ← Sąrašas
                  </button>
                )}
              </div>

              <div className="ae-support__messages">
                {detail.messages.map((m: SupportMessage) => (
                  <div
                    key={m.id}
                    className={`ae-support__msg ae-support__msg--${m.authorRole === mode ? "mine" : "theirs"}`}
                  >
                    <p className="ae-support__msg-head">
                      <strong>{m.authorLabel}</strong>
                      <span>{formatDt(m.createdAt)}</span>
                    </p>
                    <p className="ae-support__msg-body">{m.body}</p>
                  </div>
                ))}
              </div>

              <form className="ae-support__reply" onSubmit={submitReply}>
                <textarea
                  rows={3}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Jūsų atsakymas…"
                  required
                />
                <button type="submit" className="ae-btn ae-btn--primary" disabled={busy || !replyBody.trim()}>
                  {busy ? "Siunčiama…" : "Siųsti atsakymą"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
