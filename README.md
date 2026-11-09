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
- Browser localStorage

## Running the Application

1. Open a terminal in the frontend directory.
2. Install the dependencies:

   `npm install`

3. Start the development server:

   `npm run dev`

- might be necessary to run these commands instead

  `fnm env --use-on-cd | Out-String | Invoke-Expression`
  `fnm use 26`
  `npm.cmd run dev`

4. Open http://localhost:3000 in your browser.

## Running Tests

To run the automated tests, use:

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

SQL database implementation and backend integration are planned for future development phases.
