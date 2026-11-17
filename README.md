# Spend Sense

An expense tracking application focused on setting and achieving budgeting goals.

## Team Members

- Alex Walker
- Marshall McDougall
- Teegan Buttigieg

## Technologies

- Next.js
- React
- TypeScript
- Vitest
- React Testing Library
- PostgreSQL + Prisma (optional Stage 1 local-only mode); browser localStorage fallback

## Running the Application

1. Open a terminal in the frontend directory.
2. Install the dependencies:

   `npm install`

3. Start the development server: {make sure you are in the frontend folder}

   `npm run dev`

- might be necessary to run these commands instead

  `fnm env --use-on-cd | Out-String | Invoke-Expression`
  `fnm use 26`
  `npm.cmd run dev`

4. Open http://localhost:3000 in your browser.

## Running Tests

To run the automated tests, use: {make sure you are in the frontend folder}

`npm test`

The tests cover budget validation, calculations, dashboard interactions, and localStorage behaviour.

## Current Functionality

- Create budgets and savings goals.
- Validate budget information.
- View budget progress and remaining amounts.
- Calculate required monthly savings.
- Delete budgets.
- Save budget information using browser localStorage.

## Future Development

Stage 1 PostgreSQL schema and local-only backend API are implemented. Authentication and secure multi-user data access remain Stage 2. See [STAGE-1-DATABASE.md](STAGE-1-DATABASE.md).

## Stage 1

See [STAGE-1-DATABASE.md](STAGE-1-DATABASE.md) for database setup, migration, and security notes. Run `npm install` to regenerate `package-lock.json` after installing the new dependencies.
