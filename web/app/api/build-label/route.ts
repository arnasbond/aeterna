import { NextResponse } from "next/server";
import { getBuildLabel } from "@/lib/build-label";
import { isCommitLabel } from "@/lib/is-commit-label";

export const dynamic = "force-dynamic";

export async function GET() {
  let label = getBuildLabel();
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
