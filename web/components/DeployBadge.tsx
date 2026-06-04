"use client";

/** Matoma telefone ir PC — ar tikrai naujausias deploy (ne sena talpykla). */
export function DeployBadge() {
  const label = process.env.NEXT_PUBLIC_BUILD_LABEL || "local";
  return (
    <p
      className="ae-deploy-badge"
      title="Jei telefone kitoks žymėjimas — svetainė dar ne atnaujinta debesyje"
    >
      Svetainės versija: <strong>{label}</strong>
    </p>
  );
}
