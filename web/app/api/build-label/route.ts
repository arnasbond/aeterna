import { NextResponse } from "next/server";
import { getBuildLabel } from "@/lib/build-label";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { label: getBuildLabel() },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
