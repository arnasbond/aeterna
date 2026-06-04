import { getBuildLabel } from "@/lib/build-label";

/** Server HTML — WebView gauna commit iš karto (ne seną „vercel“ iš JS cache). */
export function DeployBadge() {
  const label = getBuildLabel();
  const host =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "") ||
    process.env.VERCEL_URL?.replace(/\/$/, "") ||
    "aeterna-mauve.vercel.app";

  const showHost = label !== "local" && label !== "vercel" && label.length >= 4;

  return (
    <p
      className="ae-deploy-badge"
      data-build={label}
      id="aeterna-deploy-badge"
      suppressHydrationWarning
    >
      Svetainės versija: <strong id="aeterna-build-label">{label}</strong>
      {showHost ? (
        <>
          {" "}
          · <span className="ae-deploy-badge__host">{host}</span>
        </>
      ) : null}
    </p>
  );
}
