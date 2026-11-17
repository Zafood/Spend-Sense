"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function register(event: React.FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined, email, password }),
      });
      if (!response.ok) { const data = await response.json(); setError(data.error ?? "Registration failed."); return; }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) setError("Account created. Please sign in.");
      else router.push("/dashboard");
    } catch { setError("Registration unavailable. Try again later."); }
    finally { setBusy(false); }
  }
  return <main style={{ maxWidth: 430, margin: "4rem auto", padding: 24 }}>
    <h1>Create your Spend Sense account</h1>
    <form onSubmit={register}>
      <label htmlFor="register-name">Display name (optional)</label><br />
      <input id="register-name" maxLength={120} autoComplete="name" value={name} onChange={e => setName(e.target.value)} /><br />
      <label htmlFor="register-email">Email</label><br />
      <input id="register-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /><br />
      <label htmlFor="register-password">Password (minimum 12 characters)</label><br />
      <input id="register-password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /><br />
      <button type="submit" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
    </form>
    {error && <p role="alert">{error}</p>}
    <p>Already registered? <Link href="/login">Sign in</Link></p>
  </main>;
}
