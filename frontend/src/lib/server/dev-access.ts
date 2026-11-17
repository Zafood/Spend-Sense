import "server-only";
import { NextResponse } from "next/server";

// Stage 1 has no login system. Never expose these endpoints in production.
// A single, explicitly configured local-development user is allowed.
export function getLocalDevelopmentUserId(): string | null {
  if (process.env.NODE_ENV !== "development" || process.env.ENABLE_DEV_DATABASE_API !== "true") {
    return null;
  }
  const userId = process.env.DEV_USER_ID;
  return userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    ? userId
    : null;
}

export function notAvailable() {
  return NextResponse.json({ error: "Database API unavailable until authentication is implemented." }, { status: 404 });
}
