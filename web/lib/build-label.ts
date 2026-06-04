import { isCommitLabel } from "./is-commit-label";

function shortGitSha(): string | null {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (sha && sha.length >= 7 && /^[0-9a-f]+$/i.test(sha)) {
    return sha.slice(0, 7).toLowerCase();
  }
  return null;
}

/** Vercel production — tikras commit hash. */
export function getBuildLabel(): string {
  const sha = shortGitSha();
  if (sha) return sha;

  const pub = process.env.NEXT_PUBLIC_BUILD_LABEL?.trim();
  if (pub && isCommitLabel(pub)) return pub.toLowerCase();

  if (process.env.NODE_ENV === "production") {
    return "…";
  }

  return "local";
}
