# Stage 1 — PostgreSQL database

Stage 1 adds a PostgreSQL schema, migration, Prisma integration, and a **local-development-only** database-backed savings goal dashboard. No production login exists yet. **Do not expose this version to public users.** Authentication and per-user access enforcement are Stage 2.

## Data model

- `users`: planned user identity and a nullable `password_hash` field (Stage 2 will implement registration, password hashing, and sessions).
- `savings_goals`: existing budget/savings-goal fields, owned by a user. Monetary values are `DECIMAL(12,2)`, goal dates are PostgreSQL `DATE`.
- `transactions`: an independent, user-owned `INCOME`/`EXPENSE` model reserved for Stage 3; transactions are not connected to savings-goal balances.

Every savings goal and transaction has an indexed user foreign key and is deleted if its user is removed. Application-level queries scope by user ID; Stage 2 must derive that ID from a verified session. Database row-level security is **not** enabled by this migration.

## Local setup (Windows PowerShell)

1. Install Node.js 20.19+ (22.12+ recommended) and PostgreSQL. Create a new, empty PostgreSQL database named `spend_sense`. Use a dedicated database account with access only to that database. You can instead use a private hosted PostgreSQL database.
2. Open a terminal in `frontend` and run `npm install`.
3. Copy `frontend/.env.example` to `frontend/.env.local`. Set `DATABASE_URL` to your **actual** database credentials. Never commit this file.
4. Run `npx prisma migrate deploy` and `npx prisma generate`. These commands create the tables and generate the database client.
5. Run `npm run db:dev-user`. Copy the printed UUID into `DEV_USER_ID` in `.env.local`. This user is a local-only placeholder, **not** a registered account.
6. Ensure `ENABLE_DEV_DATABASE_API="true"` and `NEXT_PUBLIC_USE_DATABASE="true"` are set in `.env.local`.
7. Run `npm run dev` and visit http://localhost:3000. New savings goals are saved in PostgreSQL instead of localStorage.
8. Run `npm test` and `npm run lint` for automated checks.

**Important:** Next.js loads `.env.local` automatically, but the Prisma CLI does not. For the two `npx prisma ...` commands and `npm run db:dev-user`, export `DATABASE_URL` to the PowerShell process beforehand:

```powershell
# Replace with the actual URL from your private .env.local:
$env:DATABASE_URL = "postgresql://USERNAME:PASSWORD@localhost:5432/spend_sense?schema=public"
npx prisma migrate deploy
npx prisma generate
npm run db:dev-user
```

For localStorage mode, set `NEXT_PUBLIC_USE_DATABASE="false"`. This preserves the original functionality while the database is being configured. **There is no automatic migration of data previously stored in browsers.** Do not delete your localStorage data until an explicit, user-owned import mechanism is added after authentication.

## Security restrictions and follow-up

- `/api/dev/savings-goals` and `/api/dev/savings-goals/[id]` are only accessible when `NODE_ENV=development`, `ENABLE_DEV_DATABASE_API=true`, and `DEV_USER_ID` is a valid UUID. Production requests return HTTP 404.
- These endpoints are **not authenticated** and should only be used on a trusted local machine. Do not expose the development server to untrusted networks.
- Stage 2 will replace these routes with authenticated routes, enforce ownership based on server-verified session identity, implement password hashing and CSRF-safe authenticated mutations, and remove the placeholder account path.
- The existing UI and original test suite continue to support browser localStorage when database mode is disabled.
- Schema and source code can be tested without a live database. Database operations cannot be verified until `DATABASE_URL` references a running PostgreSQL instance.
