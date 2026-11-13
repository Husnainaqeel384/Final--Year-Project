# Contributing

Thanks for helping improve Budget Book. Bug reports, ideas and pull requests are all welcome.

## Setup

Follow [Getting started](README.md#getting-started), then create a branch from `master`.

## Before you open a pull request

```bash
npm run lint
npm test
npm run build
```

API tests need a MySQL server. They use the connection in your `.env` but create their own `budget_book_test` database.

## Conventions

**Database**
- Change the schema only by adding a new file to `apps/api/migrations`. Never edit one that has already been applied.
- Store money as `DECIMAL`. Calculate derived values such as remaining amount when reading.

**API**
- Validate every input with a Zod schema, and read only from `req.valid`.
- Use `applyScope` for every query on a workspace-owned table, and add a case to `apps/api/test/isolation.test.js` proving another account can't reach the data.
- Throw `AppError` for messages that are safe to show to users.

**Web app**
- State lives in Redux Toolkit slices in `src/redux/features`. API functions live in `src/api`.
- Components call the API and dispatch `setLoading`, the result action and `setError`. Don't add thunks or RTK Query.
- Use the color tokens in `src/index.css` instead of hard-coded colors.
- Give every action an accessible name, and never use color alone to show a state.

**Everywhere**
- Don't use `console.*`. Use the logger, and never log passwords, tokens or full request bodies.
- Comments should explain why, not what. Remove code instead of commenting it out.
- Never commit `.env` files, database dumps or personal data.
