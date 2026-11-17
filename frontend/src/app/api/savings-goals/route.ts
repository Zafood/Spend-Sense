import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth-user";
import { createSavingsGoal, listSavingsGoals } from "@/lib/server/savings-goals";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await listSavingsGoals(userId), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load savings goals." }, { status: 500 });
  }
}
export async function POST(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "Expected JSON." }, { status: 415 });
  }
  const input = await request.json().catch(() => null);
  if (input === null) return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  try {
    const result = await createSavingsGoal(userId, input);
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result.value, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not create savings goal." }, { status: 500 });
  }
}
