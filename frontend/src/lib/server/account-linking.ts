import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { headers, cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/server/prisma";

export type LinkProvider = "github" | "google";
const ALLOWED = new Set<LinkProvider>(["google", "github"]);
const FIVE_MINUTES = 5 * 60 * 1000;

function sha(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function secureCookie(): boolean {
  return process.env.AUTH_URL?.startsWith("https://") ?? false;
}

function cookieName(provider: LinkProvider) {
  return `spend-sense.link-${provider}`;
}

function cookiePath(provider: LinkProvider) {
  return `/api/auth/callback/${provider}`;
}

// Read and cryptographically verify the ORIGINAL Auth.js JWT cookie, not an
// untrusted user ID from the browser. Bind the link intent to this token.
export async function verifiedSessionToken(): Promise<{ userId: string; fingerprint: string } | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const incoming = await headers();
  const request = new Request("http://localhost", { headers: { cookie: incoming.get("cookie") ?? "" } });
  const opts = { req: request, secret, secureCookie: secureCookie() };
  const [decoded, raw] = await Promise.all([
    getToken(opts),
    getToken({ ...opts, raw: true }),
  ]);
  if (!decoded || typeof decoded.userId !== "string" || typeof raw !== "string") return null;
  return { userId: decoded.userId, fingerprint: sha(raw) };
}

export async function createLinkIntent(provider: LinkProvider, authenticatedUserId: string) {
  if (!ALLOWED.has(provider)) throw new Error("Invalid provider");
  const identity = await verifiedSessionToken();
  if (!identity || identity.userId !== authenticatedUserId) throw new Error("Sign in again to link an account");
  const nonce = randomBytes(32).toString("base64url");
  await prisma.accountLinkIntent.create({
    data: {
      userId: identity.userId,
      provider,
      nonceHash: sha(nonce),
      sessionFingerprint: identity.fingerprint,
      expiresAt: new Date(Date.now() + FIVE_MINUTES),
    },
  });
  (await cookies()).set(cookieName(provider), nonce, {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: "lax",
    path: cookiePath(provider),
    maxAge: FIVE_MINUTES / 1000,
  });
}

export async function hasLinkIntent(provider: LinkProvider): Promise<boolean> {
  const nonce = (await cookies()).get(cookieName(provider))?.value;
  return Boolean(nonce);
}

export type LinkOutcome = "linked" | "already-linked" | "conflict" | "invalid";

// Called ONLY after Auth.js has verified the provider's OAuth authorization
// code/state and given us the provider's stable account ID.
export async function consumeLinkIntent(provider: LinkProvider, providerAccountId: string): Promise<LinkOutcome> {
  const jar = await cookies();
  const nonce = jar.get(cookieName(provider))?.value;
  if (!nonce || nonce.length < 32) return "invalid";

  // Always expire the linking cookie after the callback, even if the link fails.
  jar.set(cookieName(provider), "", {
    httpOnly: true, secure: secureCookie(), sameSite: "lax", path: cookiePath(provider), maxAge: 0,
  });
  const identity = await verifiedSessionToken();
  if (!identity) return "invalid";

  const attempt = await prisma.accountLinkIntent.findUnique({ where: { nonceHash: sha(nonce) } });
  if (!attempt || attempt.provider !== provider || attempt.userId !== identity.userId ||
      attempt.usedAt || attempt.expiresAt <= new Date()) return "invalid";

  const a = Buffer.from(attempt.sessionFingerprint, "hex");
  const b = Buffer.from(identity.fingerprint, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "invalid";

  // Complete atomically, preventing replay and concurrent double linking.
  try {
    return await prisma.$transaction(async tx => {
      const claimed = await tx.accountLinkIntent.updateMany({
        where: { id: attempt.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      if (claimed.count !== 1) return "invalid";
      const existing = await tx.account.findUnique({ where: { provider_providerAccountId: { provider, providerAccountId } } });
      if (existing) return existing.userId === identity.userId ? "already-linked" : "conflict";
      const other = await tx.account.findFirst({ where: { userId: identity.userId, provider } });
      if (other) return "conflict"; // One external identity per provider per Spend Sense user.
      await tx.account.create({ data: { userId: identity.userId, type: "oauth", provider, providerAccountId } });
      return "linked";
    });
  } catch {
    // Unique account indexes also enforce ownership under concurrent requests.
    return "conflict";
  }
}
