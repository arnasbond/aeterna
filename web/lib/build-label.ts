/** Vercel runtime / build — tikra deploy versija (ne „local“ telefone). */
export function getBuildLabel(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (sha && sha.length >= 7) return sha.slice(0, 7);

  const ref = process.env.VERCEL_GIT_COMMIT_REF?.trim();
  if (ref && ref !== "main") return ref.slice(0, 12);

  const pub = process.env.NEXT_PUBLIC_BUILD_LABEL?.trim();
  if (pub && pub !== "local") return pub;

  if (process.env.VERCEL === "1") {
    const dep = process.env.VERCEL_DEPLOYMENT_ID?.trim();
    if (dep && dep.length >= 7) return dep.slice(-7);
    return "vercel";
  }

  return process.env.NODE_ENV === "production" ? "prod" : "local";
}
