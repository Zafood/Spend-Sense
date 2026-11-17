import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "./prisma";

const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 6;

// A salted keyed digest avoids storing raw email addresses in rate-limit records.
function keyFor(kind: string, value: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be configured.");
  return createHash("sha256").update(`${secret}:${kind}:${value}`).digest("hex");
}

export async function isLimited(kind: string, subject: string) {
  const key = keyFor(kind, subject);
  const record = await prisma.authThrottle.findUnique({ where: { key } });
  return Boolean(record?.blockedUntil && record.blockedUntil > new Date());
}

// Atomic SQL prevents concurrent failed attempts from overwriting each other.
export async function recordFailure(kind: string, subject: string) {
  const key = keyFor(kind, subject);
  const now = new Date();
  const cutoff = new Date(now.getTime() - WINDOW_MS);
  await prisma.$executeRaw`
    INSERT INTO auth_throttles (key, attempts, window_start, blocked_until)
    VALUES (${key}, 1, ${now}, NULL)
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE WHEN auth_throttles.window_start < ${cutoff}
        THEN 1 ELSE auth_throttles.attempts + 1 END,
      window_start = CASE WHEN auth_throttles.window_start < ${cutoff}
        THEN ${now} ELSE auth_throttles.window_start END,
      blocked_until = CASE WHEN auth_throttles.window_start >= ${cutoff}
        AND auth_throttles.attempts + 1 >= ${MAX_ATTEMPTS}
        THEN ${new Date(now.getTime() + WINDOW_MS)} ELSE NULL END
  `;
}

export async function clearFailures(kind: string, subject: string) {
  await prisma.authThrottle.deleteMany({ where: { key: keyFor(kind, subject) } });
}
