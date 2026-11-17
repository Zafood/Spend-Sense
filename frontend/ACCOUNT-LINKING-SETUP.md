# Spend Sense — Account linking (Phase 2 addendum)

This addendum updates the earlier Phase 2 preview with **explicit, authenticated Google/GitHub account linking**. No existing user or savings-goal records need to be deleted. This is source code prepared for local verification, not a deployment-certified security review.

## Applying the changes

1. Back up your Neon database. Use the repository ZIP as a **reference** or apply its changed files on a new branch based on your current `main` branch; never overwrite `.env` or `.env.local` with example values.
2. In `frontend`, run `npm install`, `npx prisma generate`, and `npx prisma migrate deploy` against the correct Neon database.
3. Keep `AUTH_SECRET` unchanged; changing it invalidates existing sessions. Set Google/GitHub OAuth client credentials and `AUTH_URL=http://localhost:3000`. Use `AUTH_TRUST_HOST=true` locally.
4. Restart the server with `npm run dev`.
5. Sign in with **Google** as you do currently. Visit `/settings/accounts` (also linked on the dashboard). Click **Connect GitHub**, complete GitHub authorization, and return to account settings. Both providers should say **Connected**.
6. Log out; use **GitHub** to sign back in. Verify the original Google-created savings goals are visible. Repeat after logging out with Google.
7. Run `npm test`, `npm run lint`, `npm run build`, `npm audit`, and `npx prisma validate`; report any failures.

## Security properties

- Link initiation requires a valid existing Auth.js session and an explicit POST Server Action.
- OAuth must complete provider validation and state checks in Auth.js.
- A five-minute, HTTP-only, same-site linking cookie is restricted to the provider callback path.
- A single-use database intent is bound to the user and the exact existing Auth.js session token.
- The callback atomically marks the intent used and associates the verified GitHub/Google provider account to the **existing** user. No email-only merging occurs.
- If the external account is linked to a different user, linking is refused.
- The OAuth callback returns to account settings rather than replacing the existing session.
- This implementation deliberately does not allow unlinking yet, to prevent accidental lockout.

## Limitations / troubleshooting

- The session cookie may rotate while OAuth is in progress in certain environments; in that case, linking fails closed with an expired/changed-session message. Sign in again and retry.
- If `/settings/accounts?error=conflict`, the provider identity belongs to another account or an identity of that provider is already connected. Do not delete user records without reviewing their financial data.
- Existing Google and GitHub OAuth callback URLs remain `/api/auth/callback/google` and `/api/auth/callback/github`.
- OAuth credentials, database credentials, and `AUTH_SECRET` must remain outside Git.
- If your local repo contains newer changes than this preview, cherry-pick or manually merge only the linking-specific changes rather than copying the whole ZIP.
- This environment could not install npm dependencies or execute live OAuth, so local build, authentication and security testing are **required** before deployment.
