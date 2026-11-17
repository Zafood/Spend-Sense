import { NextRequest, NextResponse } from "next/server";
import { hash } from "argon2";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { registerSchema } from "@/lib/auth-input";
import { isLimited, recordFailure } from "@/lib/server/auth-throttle";

export async function POST(request: NextRequest) {
  // Registration may only be invoked by a page on this origin.
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "Expected JSON." }, { status: 415 });
  }
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid registration details." }, { status: 400 });
  const { email, password, name } = parsed.data;
  if (await isLimited("registration", email)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }
  await recordFailure("registration", email);
  try {
    const passwordHash = await hash(password, { type: 2, memoryCost: 19456, timeCost: 2, parallelism: 1 });
    await prisma.user.create({ data: { email, name, passwordHash } });
    return NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration unavailable. Try again later." }, { status: 500 });
  }
}
