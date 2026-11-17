import { NextRequest, NextResponse } from "next/server";
import { getLocalDevelopmentUserId, notAvailable } from "@/lib/server/dev-access";
import { createSavingsGoal, listSavingsGoals } from "@/lib/server/savings-goals";


export async function GET() {
  const userId = getLocalDevelopmentUserId();
  if (!userId) return notAvailable();
  try {
    return NextResponse.json(await listSavingsGoals(userId), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load savings goals." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getLocalDevelopmentUserId();
  if (!userId) return notAvailable();
  // Reject cross-site requests even in development.
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  let input: unknown;
  try { input = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  try {
    const result = await createSavingsGoal(userId, input);
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result.value, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not create savings goal." }, { status: 500 });
  }
}
