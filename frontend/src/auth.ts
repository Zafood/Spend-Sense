import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { verify } from "argon2";
import { prisma } from "@/lib/server/prisma";
import { loginSchema } from "@/lib/auth-input";
import { isLimited, recordFailure, clearFailures } from "@/lib/server/auth-throttle";
import { consumeLinkIntent, hasLinkIntent } from "@/lib/server/account-linking";

const providers = [
  Credentials({
    name: "Email and password",
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(raw) {
      const parsed = loginSchema.safeParse(raw);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;
      if (await isLimited("login", email)) return null;
      const user = await prisma.user.findUnique({ where: { email } });
      // Uniform response regardless of whether the account exists.
      const valid = user?.passwordHash ? await verify(user.passwordHash, password).catch(() => false) : false;
      if (!valid || !user) {
        await recordFailure("login", email);
        return null;
      }
      await clearFailures("login", email);
      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
  ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google({ authorization: { params: { scope: "openid email profile" } } })] : []),
  ...(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? [GitHub({ authorization: { params: { scope: "read:user user:email" } } })] : []),
];

// Limit OAuth account storage to identity keys, not long-lived provider tokens.
const prismaAdapter = PrismaAdapter(prisma);
const adapter = {
  ...prismaAdapter,
  async linkAccount(account: Parameters<NonNullable<typeof prismaAdapter.linkAccount>>[0]): Promise<void> {
    await prismaAdapter.linkAccount!({
      ...account,
      access_token: undefined,
      refresh_token: undefined,
      id_token: undefined,
      session_state: undefined,
    });
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  providers,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  // Never silently merge financial accounts by matching unverified emails.
  callbacks: {
    async signIn({ account }) {
      if (account && (account.provider === "github" || account.provider === "google") &&
          await hasLinkIntent(account.provider)) {
        const outcome = await consumeLinkIntent(account.provider, account.providerAccountId);
        // Returning an internal URL aborts Auth.js's regular sign-in operation.
        // This keeps the original user's session instead of switching accounts.
        if (outcome === "linked" || outcome === "already-linked") {
          return `/settings/accounts?linked=${account.provider}`;
        }
        return `/settings/accounts?error=${outcome}`;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.userId === "string") session.user.id = token.userId;
      return session;
    },
    authorized({ auth }) { return Boolean(auth?.user); },
  },
  trustHost: process.env.AUTH_TRUST_HOST === "true",
});
