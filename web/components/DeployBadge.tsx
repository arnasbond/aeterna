import { getBuildLabel } from "@/lib/build-label";
import { getEmbeddedCommit } from "@/lib/embedded-commit";
import { isCommitLabel } from "@/lib/is-commit-label";

/** Server HTML — commit iš commit-hash.txt (veikia ir WebView be JS fetch). */
export function DeployBadge() {
  const host =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "") ||
    process.env.VERCEL_URL?.replace(/\/$/, "") ||
    "aeterna-mauve.vercel.app";

  const label = getEmbeddedCommit() || getBuildLabel();
  const display = isCommitLabel(label) ? label : "…";

  return (
    <p className="ae-deploy-badge" id="aeterna-deploy-badge" suppressHydrationWarning>
      Svetainės versija:{" "}
      <strong id="aeterna-build-label" data-commit={display}>
        {display}
      </strong>
      {" "}
      · <span className="ae-deploy-badge__host">{host}</span>
    </p>
  );
}
