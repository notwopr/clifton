import { NextRequest, NextResponse } from "next/server";
import { fetchTrials } from "@/lib/clinicaltrials";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const condition = searchParams.get("condition") ?? "";
  const keywords = searchParams.get("keywords")?.split(",").filter(Boolean) ?? [];
  const maxResults = parseInt(searchParams.get("maxResults") ?? "200", 10);

  if (!condition.trim()) {
    return NextResponse.json({ error: "condition is required" }, { status: 400 });
  }

  try {
    const result = await fetchTrials({ condition, keywords, maxResults });
    return NextResponse.json(result, {
      headers: {
        // Cache at edge for 1 hour — trials don't change that fast
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
