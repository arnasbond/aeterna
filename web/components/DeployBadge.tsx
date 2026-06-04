import { BuildLabelClient } from "@/components/BuildLabelClient";

export function DeployBadge() {
  const host =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "") ||
    process.env.VERCEL_URL?.replace(/\/$/, "") ||
    "aeterna-mauve.vercel.app";

  return (
    <p className="ae-deploy-badge" id="aeterna-deploy-badge" suppressHydrationWarning>
      Svetainės versija: <BuildLabelClient />
      {" "}
      · <span className="ae-deploy-badge__host">{host}</span>
    </p>
  );
}
