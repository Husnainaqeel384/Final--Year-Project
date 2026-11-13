# API reference

The base path is `/api/v1`. Requests and responses use JSON unless noted.

## Conventions

**Authentication.** `POST /auth/login` sets an `httpOnly` session cookie. Every endpoint needs it unless marked public.

**Workspaces.** Requests act on the signed-in user's personal workspace. To act on an organization, send its id:

```http
X-Organization-Id: 7
```

**Responses.**

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "Budget not found" }
```

| Status | Meaning |
| --- | --- |
| `400` | Invalid input |
| `401` | Not signed in, or the session has expired |
| `403` | Signed in, but not allowed |
| `404` | Doesn't exist, or belongs to someone else |
| `409` | Already exists |
| `429` | Too many requests |

Months use `YYYY-MM` and dates use `YYYY-MM-DD`.

## Authentication

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| POST | `/auth/register` | `firstName, lastName, username, email, password` | Public |
| POST | `/auth/login` | `email, password` | Public. Sets the session cookie |
| POST | `/auth/logout` | | Public |
| POST | `/auth/forgot-password` | `email` | Public. The response is the same whether or not the account exists |
| POST | `/auth/reset-password` | `token, password` | Public |
| GET | `/auth/me` | | Current user and their organizations |
| PATCH | `/auth/me` | `firstName, lastName, username, email, currency` | |
| POST | `/auth/me/avatar` | Multipart field `file` | JPG, PNG or WebP, up to 2 MB |
| POST | `/auth/me/password` | `currentPassword, newPassword` | Signs out other devices |

## Dashboard and reports

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/dashboard?month=` | Totals, forecast, 12-month trend, categories, reminders and recent transactions |
| GET | `/reports/months` | Months that have a budget |
| GET | `/reports/:month` | All of the month's budgets added together, a per-budget breakdown, and the previous month for comparison |

## Budgets

A month can hold several named budgets, for example "Household" and "Vacation". Names must be unique within a month. Creating, changing and deleting budgets needs the owner or admin role in an organization.

| Method | Path | Body or query |
| --- | --- | --- |
| GET | `/budgets` | Optional query: `month` |
| POST | `/budgets` | `name, month, income, savingsGoal`, optional `copyFromId` to copy another budget's categories |
| GET | `/budgets/:id` | Includes `unplanned`: spending in categories the budget doesn't plan for |
| PATCH | `/budgets/:id` | `name, income, savingsGoal` |
| DELETE | `/budgets/:id` | |
| POST | `/budgets/:id/items` | `items: [{ categoryName, amount }]` |
| PATCH | `/budgets/:id/items/:itemId` | `amount` |
| DELETE | `/budgets/:id/items/:itemId` | |

## Expenses and transactions

| Method | Path | Body or query |
| --- | --- | --- |
| GET | `/expenses?month=` | |
| POST | `/expenses` | `categoryName, amount, description, spentOn`, optional `budgetId` |
| PATCH | `/expenses/:id` | Same as POST |
| DELETE | `/expenses/:id` | |
| GET | `/transactions` | Query: `search, type, page, limit` |
| POST | `/transactions` | `type, date, amount, sender, receiver, method, description` |
| PATCH | `/transactions/:id` | Same as POST |
| DELETE | `/transactions/:id` | |

`budgetId` decides which budget an expense counts toward. It must be a budget in the same month. Send `null` to leave the expense unassigned. Leave it out and the month's budget is used if there is exactly one.

`type` is `sent`, `received` or `pending`.

## Reminders and notes

| Method | Path | Body |
| --- | --- | --- |
| GET | `/reminders` | |
| POST | `/reminders` | `title, dueDate` |
| PATCH | `/reminders/:id` | Any of `title, dueDate, status` |
| DELETE | `/reminders/:id` | |
| GET | `/notes` | |
| POST | `/notes` | `body` |
| PATCH | `/notes/:id` | `body` |
| DELETE | `/notes/:id` | |

## Bill splitting

Splits belong to people, so these endpoints ignore `X-Organization-Id`.

| Method | Path | Body |
| --- | --- | --- |
| GET | `/splits/contacts` | |
| POST | `/splits/contacts` | `username` |
| DELETE | `/splits/contacts/:id` | |
| GET | `/splits/groups` | |
| POST | `/splits/groups` | `name, members: [username]` |
| GET | `/splits/groups/:id` | Members only |
| DELETE | `/splits/groups/:id` | Creator only |
| POST | `/splits/groups/:id/bills` | `amount, mode` (`equal` or `paid-by-me`) |
| POST | `/splits/groups/:id/settle` | `amount` |

## Organizations

| Method | Path | Body | Role |
| --- | --- | --- | --- |
| GET | `/organizations` | | Any |
| POST | `/organizations` | `name, currency` | Any |
| GET | `/organizations/:id` | | Member |
| PATCH | `/organizations/:id` | `name, currency` | Admin |
| DELETE | `/organizations/:id` | | Owner |
| POST | `/organizations/:id/invitations` | `email, role` | Admin |
| DELETE | `/organizations/:id/invitations/:invitationId` | | Admin |
| POST | `/organizations/invitations/accept` | `token` | Invited email only |
| PATCH | `/organizations/:id/members/:userId` | `role` | Admin |
| DELETE | `/organizations/:id/members/:userId` | | Admin |

## Categories and administration

Reading categories is open to any signed-in user. All other endpoints here need the administrator role.

| Method | Path | Body |
| --- | --- | --- |
| GET | `/categories` | |
| POST | `/categories` | `name` |
| PATCH / DELETE | `/categories/:id` | `name` for PATCH |
| POST | `/categories/:id/subcategories` | `name` |
| PATCH / DELETE | `/categories/subcategories/:id` | `name` for PATCH |
| GET | `/admin/users` | |
| PATCH | `/admin/users/:id` | `role` |
| DELETE | `/admin/users/:id` | |

## Integrations

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/integrations/export/transactions.xlsx` | Also `.csv`, and `expenses`. Optional `?month=` |
| GET | `/integrations/export/budget.xlsx?month=` | Also `.csv` |
| GET | `/integrations/templates/transactions.xlsx` | Also `expenses` |
| POST | `/integrations/import/transactions` | Multipart field `file`, up to 5 MB and 5,000 rows. Also `expenses` |
| GET | `/integrations/reports/:month.pdf` | |
| GET / POST | `/integrations/feeds` | POST body: `kind` (`calendar` or `sheets`). The URL is returned once |
| DELETE | `/integrations/feeds/:id` | |
| GET / POST | `/integrations/webhooks` | POST body: `name, provider, url, events` |
| POST | `/integrations/webhooks/:id/test` | |
| DELETE | `/integrations/webhooks/:id` | |

### Public feeds

These use the secret token in the URL instead of a session.

| Path | Format |
| --- | --- |
| `/feeds/:token/reminders.ics` | iCalendar |
| `/feeds/:token/transactions.csv` | CSV |

### Webhook events

| Event | Sent when |
| --- | --- |
| `expense.created` | An expense is added |
| `transaction.created` | A transaction is added |
| `budget.threshold` | A category crosses 80% or 100% of its plan |

Slack and Discord receive a plain message. Other webhooks receive JSON with a signature:

```http
X-BudgetBook-Signature: sha256=<HMAC-SHA256 of the raw body, using the webhook's secret>
```

```json
{
  "event": "budget.threshold",
  "message": "Budget alert: Groceries has reached 84% of its 2026-03 budget.",
  "data": { "category": "Groceries", "month": "2026-03", "percentUsed": 84, "threshold": 80 },
  "sentAt": "2026-03-21T10:15:00.000Z"
}
```

## Health check

`GET /health` (public, outside `/api/v1`) returns `{ "status": "ok" }` when the API can reach the database.
