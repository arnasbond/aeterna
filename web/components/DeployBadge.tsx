import { isCommitLabel } from "@/lib/is-commit-label";

export const dynamic = "force-dynamic";

async function fetchCommitFromSite(): Promise<string | null> {
  const host =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "https://aeterna-mauve.vercel.app";

  try {
    const r = await fetch(`${host}/commit-hash.txt`, { cache: "no-store" });
    if (!r.ok) return null;
    const t = (await r.text()).trim().toLowerCase();
    return isCommitLabel(t) ? t : null;
  } catch {
    return null;
  }
}

/** Server fetch — tas pats failas kaip PC Chrome (12047cf). */
export async function DeployBadge() {
  const host =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "") ||
    process.env.VERCEL_URL?.replace(/\/$/, "") ||
    "aeterna-mauve.vercel.app";

  const commit = (await fetchCommitFromSite()) ?? "…";

  return (
    <p className="ae-deploy-badge" id="aeterna-deploy-badge">
      Svetainės versija:{" "}
      <strong id="aeterna-build-label">{commit}</strong>
      {" "}
      · <span className="ae-deploy-badge__host">{host}</span>
    </p>
  );
}
