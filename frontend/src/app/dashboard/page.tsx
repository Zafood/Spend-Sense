import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import Home from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem" }}>
      <span>Signed in as {session.user.email ?? "User"} · <Link href="/transactions">Transactions</Link> · <a href="/settings/accounts">Connected accounts</a></span>
      <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
        <button type="submit">Log out</button>
      </form>
    </div>
    <Home />
  </>;
}
