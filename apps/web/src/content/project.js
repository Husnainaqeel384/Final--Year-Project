/**
 * Facts about the project used by the home, About and case study pages.
 * Every figure here can be checked in the repository; keep them in one place
 * so the pages never disagree, and update them when the code changes:
 *   endpoints   router.get/post/put/patch/delete calls in apps/api/src, minus routes
 *               a feature switch keeps off (apps/api/src/config/features.js)
 *   tests       `npm test`: API tests + web tests
 *   migrations  files in apps/api/migrations
 *   2023 values the last 2023 commit (29 May 2023) in git history
 */
export const PROJECT = {
  started: 'March 2023',
  firstVersionDone: 'May 2023',
  rebuilt: '2026',
  license: 'MIT',
  // 126 API (run, not skipped) + 14 web. Update when tests are added or removed.
  tests: 140,
  migrations: 13,
  // 94 in the code, less the 9 bill-splitting routes that are switched off.
  endpoints: 85,
  currencies: 20,
  aiProviders: ['Claude', 'ChatGPT', 'Gemini', 'DeepSeek'],
};

// Figures come from PROJECT above, so they can only ever be updated in one place.
export const THEN_AND_NOW = [
  { label: 'API endpoints', then: '63', now: String(PROJECT.endpoints) },
  { label: 'Automated tests', then: '0', now: String(PROJECT.tests) },
  { label: 'Database changes', then: 'Shared SQL dump', now: `${PROJECT.migrations} versioned migrations` },
  { label: 'Workspaces', then: 'One per person', now: 'Personal and team, with roles' },
  { label: 'Sign-in', then: 'Bearer token sent by the browser code', now: 'httpOnly cookie, revoked on password change' },
  { label: 'Running it', then: 'Two apps started by hand', now: 'One command, or Docker Compose' },
  { label: 'Integrations', then: 'None', now: 'Excel, CSV, PDF, Sheets, calendar, Slack, Discord, webhooks' },
  { label: 'AI', then: 'None', now: 'Receipt scanning and monthly summaries' },
];

export const STACK = [
  { layer: 'Web app', items: 'React 19, Redux Toolkit, React Router 7, Tailwind CSS 4, Chart.js, Vite' },
  { layer: 'API', items: 'Node.js, Express 5, Knex, Zod, Pino' },
  { layer: 'Database', items: 'MySQL 8 with versioned migrations' },
  { layer: 'AI', items: 'Anthropic SDK for Claude; OpenAI, Gemini and DeepSeek REST APIs' },
  { layer: 'Delivery', items: 'Docker Compose, nginx, GitHub Actions' },
  { layer: 'Testing', items: 'Vitest and Supertest, against a dedicated test database' },
];
