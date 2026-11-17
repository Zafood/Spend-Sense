import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/prisma";
import { connectProvider } from "./actions";

export default async function ConnectedAccountsPage({
  searchParams,
}: { searchParams: Promise<{ linked?: string; error?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { linked, error } = await searchParams;
  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id }, select: { provider: true },
  });
  const linkedProviders = new Set(accounts.map(a => a.provider));
  const notices: Record<string, string> = {
    github: "GitHub connected. You can now use GitHub to sign in to this account.",
    google: "Google connected. You can now use Google to sign in to this account.",
  };
  const errors: Record<string, string> = {
    conflict: "This external account is already linked, or you already connected another account from this provider.",
    invalid: "The account-linking request expired or your session changed. Please sign in and try again.",
  };
  return <main style={{ maxWidth: 650, margin: "4rem auto", padding: 24 }}>
    <p><Link href="/dashboard">Back to dashboard</Link></p>
    <h1>Connected accounts</h1>
    <p>Connect another sign-in method to your existing Spend Sense account. Financial records stay under the same user.</p>
    {linked && notices[linked] && <p role="status">{notices[linked]}</p>}
    {error && errors[error] && <p role="alert">{errors[error]}</p>}
    {(["google", "github"] as const).map(provider => <section key={provider} style={{ border: "1px solid #8885", padding: 18, marginBottom: 14, borderRadius: 8 }}>
      <h2 style={{ textTransform: "capitalize" }}>{provider}</h2>
      {linkedProviders.has(provider)
        ? <p>Connected</p>
        : <form action={connectProvider}>
            <input type="hidden" name="provider" value={provider} />
            <button type="submit">Connect {provider === "google" ? "Google" : "GitHub"}</button>
          </form>}
    </section>)}
    <p>For security, account connections can only be started while signed in.</p>
  </main>;
}
