import { BuildLabelClient } from "@/components/BuildLabelClient";
import { getBuildLabel } from "@/lib/build-label";
import { isCommitLabel } from "@/lib/is-commit-label";

export function DeployBadge() {
  const host =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "") ||
    process.env.VERCEL_URL?.replace(/\/$/, "") ||
    "aeterna-mauve.vercel.app";

  const serverLabel = getBuildLabel();
  const fallback = isCommitLabel(serverLabel) ? serverLabel : undefined;

  return (
    <p className="ae-deploy-badge" id="aeterna-deploy-badge" suppressHydrationWarning>
      Svetainės versija: <BuildLabelClient fallback={fallback} />
      {" "}
      · <span className="ae-deploy-badge__host">{host}</span>
    </p>
  );
}
