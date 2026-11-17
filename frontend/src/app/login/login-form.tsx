"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function login(event: React.FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) setError("Invalid credentials or too many attempts. Try again later.");
      else window.location.assign("/dashboard");
    } catch { setError("Sign-in unavailable. Please try again."); }
    finally { setBusy(false); }
  }
  return <main style={{ maxWidth: 430, margin: "4rem auto", padding: 24 }}>
    <h1>Sign in to Spend Sense</h1>
    <form onSubmit={login}>
      <label htmlFor="login-email">Email</label><br />
      <input id="login-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /><br />
      <label htmlFor="login-password">Password</label><br />
      <input id="login-password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /><br />
      <button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    {error && <p role="alert">{error}</p>}
    <p>Or continue with:</p>
    <button type="button" onClick={() => signIn("google", { redirectTo: "/dashboard" })}>Google</button>{" "}
    <button type="button" onClick={() => signIn("github", { redirectTo: "/dashboard" })}>GitHub</button>
    <p>New here? <Link href="/register">Create an account</Link></p>
  </main>;
}
