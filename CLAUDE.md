# Rules for Claude — Budget Book

**Status: ACTIVE — rules 1–14 approved by the owner on 2026-11-08.**

## How rules change

1. Claude may only *propose* a rule. It goes in **Proposed rules** at the bottom of this file.
2. A proposed rule has no effect until the owner approves it in the conversation.
3. Once approved, Claude moves it into the numbered list and notes the approval date.
4. Claude never edits, weakens or removes an approved rule without the same approval.

## Rules

### Data

1. **Never delete real data.** Nothing in this project is real data today: every database row, upload and dump is demo or test content. If real data is ever added, this rule protects it. If it is unclear whether something is real, treat it as real and ask first.
2. **Ask before any destructive action on data**, even demo data: `DROP`, `TRUNCATE`, bulk `DELETE`, removing uploads or dumps, overwriting a `.env`, or resetting a database volume. Claude never touches the `budget_management_system` database or `budget_management_system.sql`.
3. **Change the database only through a new migration** in `apps/api/migrations`. Never edit a migration that has already been applied.

### Protected code

4. **`images-library/` is read-only.** It is the owner's reference project. Claude reads it and never edits, moves, formats or commits it.
5. **Use only the `images-library` Redux approach** in `apps/web`:
   - `createSlice` slices in `src/redux/features/`, one `src/redux/store.js`, reducer as the default export, actions as named exports.
   - API functions live in `src/api/`. Components call them and dispatch `setLoading` / `setX` / `setError` themselves.
   - No `createAsyncThunk`, RTK Query or other state library. React context is not used for app state.
6. **If the owner adds a Redux folder, use it as provided and do not edit it.**

### Security

7. **Never commit secrets or personal data**: `.env` files, API keys, database dumps, or real people's photos and emails. This repository is open source.
8. **Every data query is scoped to the current user or organization** and every request body is validated. A feature is not done until another account has been shown unable to reach its data.

### Code quality

9. **No `console.*` calls.** Use `pino` through `apps/api/src/config/logger.js` on the API and `apps/web/src/lib/logger.js` on the web app. Never log passwords, tokens or full request bodies.
10. **Comments explain why, not what.** Do not leave commented-out code.
11. **Store money as `DECIMAL`**, never float or string. Calculate derived values such as remaining amount and percent used when reading; do not store them.
12. **Keep dependencies current** and do not add a package when the platform or an existing dependency already does the job.

### Workflow

13. **Commit or push only when the owner asks.**
14. **Report honestly.** Say what was run and what passed. If something could not be tested, say so.

## Proposed rules

_None._
