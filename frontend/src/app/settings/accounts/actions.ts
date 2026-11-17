"use server";
import { auth, signIn } from "@/auth";
import { createLinkIntent, type LinkProvider } from "@/lib/server/account-linking";

export async function connectProvider(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must sign in first");
  const provider = formData.get("provider");
  if (provider !== "google" && provider !== "github") throw new Error("Unknown provider");
  // Server Actions validate Origin/Host; never initiate linking through GET.
  await createLinkIntent(provider as LinkProvider, session.user.id);
  await signIn(provider, { redirectTo: "/settings/accounts" });
}
