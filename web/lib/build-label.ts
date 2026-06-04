import { getEmbeddedCommit } from "./embedded-commit";
import { isCommitLabel } from "./is-commit-label";

function shortGitSha(): string | null {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (sha && sha.length >= 7 && /^[0-9a-f]+$/i.test(sha)) {
    return sha.slice(0, 7).toLowerCase();
  }
  return null;
}

export function getBuildLabel(): string {
  return (
    shortGitSha() ||
    getEmbeddedCommit() ||
    (() => {
      const pub = process.env.NEXT_PUBLIC_BUILD_LABEL?.trim();
      return pub && isCommitLabel(pub) ? pub.toLowerCase() : null;
    })() ||
    (process.env.NODE_ENV === "production" ? "…" : "local")
  );
}
