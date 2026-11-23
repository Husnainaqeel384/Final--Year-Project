# Budget Book: Upwork portfolio kit

Copy-ready text and screenshots for an Upwork portfolio entry. Every figure here can be checked in this repository. The screenshots use the app's fictional demo account (Alex Morgan, "Brightside Studio"); no real people or data appear.

---

## 1. Portfolio fields

**Project title**
> Budget Book: Multi-user budgeting SaaS with AI receipt scanning (React, Node.js, MySQL)

**Your role**
> Full-stack developer

**Project description** (Upwork's short field)
> Full-stack budgeting web app for individuals and teams. Started as a university team project in 2023 and rebuilt in 2026 as an open-source SaaS: shared team workspaces with roles, monthly budgets and forecasts, bill reminders with alerts, Excel/CSV/PDF, Google Sheets, calendar, Slack and Discord integrations, and AI receipt scanning and monthly summaries using the client's own Claude, ChatGPT, Gemini or DeepSeek key. React 19, Redux Toolkit, Node.js/Express 5, MySQL, Docker, 140 automated tests.

**Skills** (Upwork allows up to five; pick the ones closest to the jobs you want)
> React · Node.js · Express.js · MySQL · AI Integration
>
> Alternatives: Redux, REST API, Full-Stack Development, SaaS, OpenAI API, Tailwind CSS, Docker

**Project link**
> https://github.com/Husnainaqeel384/Final--Year-Project
> (Add the live demo link here once it's deployed.)

---

## 2. Screenshots, in upload order

Upwork shows the first image as the cover, so lead with the strongest. All images are 1600 × 1200 (4:3), except the phone view.

| # | File | Caption |
| --- | --- | --- |
| 1 | `02-dashboard.png` | Dashboard: money left to spend, month-end forecast, 12-month cash flow, category ranking and bill alerts |
| 2 | `06-ai-receipt-scan-split.png` | AI receipt scanning: a photo becomes a pre-filled expense, or is split by category with tax shared to the cent |
| 3 | `07-ai-monthly-summary.png` | AI monthly summary: a plain-language read of the month, using figures calculated from the database |
| 4 | `04-budget-detail.png` | Budget detail: category limits with status, spending breakdown and income split |
| 5 | `14-team-dashboard.png` | Team workspace: the same tools for an organization, kept separate from personal money |
| 6 | `13-organization-team.png` | Organization members with owner, admin and member roles, and email invitations |
| 7 | `09-bill-reminders.png` | Bill reminders: weekly, monthly or yearly bills grouped by due date |
| 8 | `10-reminder-alerts.png` | Top-bar alerts for bills overdue or due in the next 3 days, with one-click payment |
| 9 | `12-ai-settings-and-limits.png` | AI settings: bring-your-own key (encrypted), model choice, and daily or weekly usage limits |
| 10 | `11-integrations.png` | Integrations: Excel and CSV import/export, Google Sheets and calendar feeds, Slack, Discord and webhooks |
| 11 | `15-dashboard-dark-mode.png` | Full dark mode |
| 12 | `16-mobile-dashboard.png` | Responsive layout on a phone |
| 13 | `01-landing-page.png` | Marketing site with SEO, FAQ and live-demo entry |
| 14 | `17-case-study.png` | Case study page: how the 2023 project was rebuilt, with real figures |

Also available: `03-budgets.png`, `05-expenses.png`, `08-transactions.png`, `18-sign-in.png`.

**About the AI screenshots (2, 3 and 9):** the screens are the real app, but the AI replies and usage counts in them are sample data, because screenshots are taken without a live provider key. The summary's figures are the demo month's real figures. If a client asks, say so; it's the honest answer and an easy one.

---

## 3. Full project description

Use this for the portfolio's longer text, your profile overview, or as a base for proposals.

### Overview
Budget Book is a full-stack web application for planning budgets, tracking spending and keeping bills on time, for one person, a household or a whole team. It began in 2023 as a university final-year project built by a team, and was rebuilt in 2026 into an open-source, multi-user platform with integrations and AI features.

### The problem
Spreadsheets record spending after the fact. People and small teams need to see, while the month is still running, how much is left in each category, where the month is heading, and which bills are coming up, without handing their financial data to a third party.

### What I built
- **Budgets and spending:** several named budgets per month with category limits, expenses and transactions with search, filters and pagination, and 20 currencies.
- **Forecasting:** month-end spending projected from the current pace, and a next-month estimate from recent months.
- **Bill reminders:** weekly, monthly or yearly bills, a top-bar alert and a dashboard banner. Marking a bill paid records the payment in the right budget, in one database transaction.
- **Teams:** personal and organization workspaces, with owner, admin and member roles and email invitations.
- **Reports:** month-by-month comparison with Excel and PDF downloads.
- **Integrations:**
  - Excel and CSV import with row-by-row error reporting;
  - Google Sheets and calendar (.ics) feeds through secret links;
  - Slack and Discord alerts;
  - HMAC-signed webhooks for Zapier and Make.
- **AI assistant:**
  - **Receipt scanning:** a photo becomes a pre-filled expense, or is split into one expense per category, with tax and discounts shared to the cent.
  - **Monthly summaries:** a plain-language read of the month.
  - **Bring your own key:** it works with the user's own Claude, ChatGPT, Gemini or DeepSeek key, encrypted at rest.
  - **Usage limits:** daily and weekly limits the user sets.
- **Public demo mode:** one-click demo sign-in, locked shared accounts and a nightly reset.

### Technical highlights
- **Data isolation by design.** Every query goes through one scoping helper, and automated tests sign in as a second account to confirm it can't reach the first one's records.
- **Exact money.** Amounts are stored as DECIMAL, and derived values (remaining, percent used) are calculated on read.
- **Security:**
  - httpOnly, SameSite cookies that are revoked on password change;
  - bcrypt password hashing;
  - rate limiting, and Zod validation on every request;
  - uploads checked by their actual bytes;
  - webhooks restricted to public addresses (SSRF protection);
  - AI keys encrypted with AES-256-GCM and kept out of logs.
- **AI done carefully:**
  - Four providers sit behind one small interface (adding one means one new file).
  - Structured JSON output is validated on the server.
  - The AI only fills forms for the user to confirm, or explains figures the database has already calculated.
  - Tests never call a real AI.
- **Delivery:** an npm workspaces monorepo, 13 versioned database migrations applied automatically, one-command setup, Docker Compose with nginx, and GitHub Actions CI running lint, tests and the build.
- **Quality:** 140 automated tests (API and web), structured logging with Pino, accessible UI with keyboard support, dark mode and a responsive layout.

### Then and now
| | 2023 (university team) | 2026 (rebuild) |
| --- | --- | --- |
| API endpoints | 63 | 85 |
| Automated tests | 0 | 140 |
| Database changes | Shared SQL dump | 13 versioned migrations |
| Workspaces | One per person | Personal and team, with roles |
| Integrations | None | Excel, CSV, PDF, Sheets, calendar, Slack, Discord, webhooks |
| AI | None | Receipt scanning and monthly summaries |

### Tech stack
- **Frontend:** React 19, Redux Toolkit, React Router 7, Tailwind CSS 4, Chart.js, Vite
- **Backend:** Node.js, Express 5, Knex, Zod, Pino
- **Database:** MySQL 8
- **AI:** Anthropic SDK (Claude); OpenAI, Gemini and DeepSeek REST APIs
- **DevOps:** Docker Compose, nginx, GitHub Actions
- **Testing:** Vitest, Supertest

---

## 4. A short version for proposals

> I recently rebuilt a budgeting SaaS (React, Node.js, MySQL) from a university project into a production-ready app. It has team workspaces with roles, integrations (Excel, Google Sheets, Slack, webhooks) and AI receipt scanning that works with Claude, ChatGPT, Gemini or DeepSeek. It's covered by 140 automated tests, including checks that one account can never see another's data. Code: https://github.com/Husnainaqeel384/Final--Year-Project

---

## Keep these figures current
The numbers above (85 endpoints, 140 tests, 13 migrations) match the code on the day the screenshots were taken. The same figures live in `apps/web/src/content/project.js`. If you add features, update both, so your portfolio never claims more than the code shows.
