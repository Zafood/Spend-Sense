# Spend Sense frontend

Next.js + TypeScript budgeting and savings goals dashboard.

## Database setup

Read [`../STAGE-1-DATABASE.md`](../STAGE-1-DATABASE.md) for PostgreSQL installation, schema migrations, local-only database mode, and security restrictions.

## Commands

```bash
npm install
npm run dev
npm test
npm run lint
```

The project deliberately does not have a committed dependency lockfile in this Stage 1 delivery because dependencies were updated without registry access. **Run `npm install` to generate `package-lock.json` and commit it before deployment or CI.** Do not use `npm ci` until the lockfile is regenerated.
