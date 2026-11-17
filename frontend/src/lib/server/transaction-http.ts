import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/server/auth-user";
export async function userOrError(): Promise<{userId:string} | {response:NextResponse}> {
  const userId = await requireUserId();
  return userId ? {userId} : {response: NextResponse.json({error:"Unauthorized"},{status:401})};
}
export function mutationError(request:NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({error:"Invalid request origin."},{status:403});
  if (request.method !== "DELETE" && !request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({error:"Expected JSON."},{status:415});
  return null;
}
export async function jsonBody(req:NextRequest) { return req.json().catch(()=>null) as Promise<unknown>; }
export const noStore = {"Cache-Control":"no-store"};
