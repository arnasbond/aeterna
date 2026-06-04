import { getBuildLabel } from "@/lib/build-label";

/** Matoma telefone ir PC — tikra Vercel deploy versija (server runtime). */
export function DeployBadge() {
  const label = getBuildLabel();
  return (
    <p
      className="ae-deploy-badge"
      title="Jei telefone „local“ — atidaryta ne production svetainė arba senas APK URL"
    >
      Svetainės versija: <strong>{label}</strong>
    </p>
  );
}
