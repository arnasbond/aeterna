import { NextResponse } from "next/server";
import { isCommitLabel } from "@/lib/is-commit-label";

export const dynamic = "force-dynamic";

/** Tik git commit SHA — niekada deployment ID (DsGUoZc, hYyLiUy). */
export async function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim() ?? "";
  let label = "…";
  if (sha.length >= 7 && /^[0-9a-f]+$/i.test(sha)) {
    label = sha.slice(0, 7).toLowerCase();
  }

  if (!isCommitLabel(label)) {
    label = "…";
  }

  return NextResponse.json(
    { label },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
