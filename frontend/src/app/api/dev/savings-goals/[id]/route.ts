import { NextRequest, NextResponse } from "next/server";
import { getLocalDevelopmentUserId, notAvailable } from "@/lib/server/dev-access";
import { deleteSavingsGoal } from "@/lib/server/savings-goals";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = getLocalDevelopmentUserId();
  if (!userId) return notAvailable();
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid savings goal ID." }, { status: 400 });
  }
  try {
    return (await deleteSavingsGoal(userId, id))
      ? new NextResponse(null, { status: 204 })
      : NextResponse.json({ error: "Savings goal not found." }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Could not delete savings goal." }, { status: 500 });
  }
}
