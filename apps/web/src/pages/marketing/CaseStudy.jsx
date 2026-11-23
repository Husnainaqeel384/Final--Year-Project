import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuCircleCheck, LuGithub } from 'react-icons/lu';
import { buttonClass } from '../../components/ui/Button';
import { GITHUB_URL, MarketingLayout } from '../../components/layout/MarketingLayout';
import { DemoButton } from '../../components/auth/DemoButton';
import { DEMO_MODE } from '../../config/features';
import { PROJECT, STACK, THEN_AND_NOW } from '../../content/project';

const STATS = [
  { value: String(PROJECT.endpoints), label: 'API endpoints' },
  { value: String(PROJECT.tests), label: 'automated tests' },
  { value: String(PROJECT.migrations), label: 'database migrations' },
  { value: String(PROJECT.aiProviders.length), label: 'AI providers supported' },
];

const MISSING_IN_2023 = [
  'No automated tests, so every change had to be checked by hand.',
  'The database was shared as an SQL dump, with no record of how its structure changed.',
  'Each person had one workspace; there was no way for a team to share a budget.',
  'Running it meant starting the API and the web app separately, with settings in two places.',
  'No connection to the tools people already use, such as Excel, calendars or Slack.',
];

const GOALS = [
  { title: 'Safe with real money', text: 'Exact amounts, accounts that cannot see each other, and sign-in that holds up on a public server.' },
  { title: 'Ready for teams', text: 'Shared workspaces with roles, so a household or a small company can plan together.' },
  { title: 'Easy to run and change', text: 'One command to start, Docker to deploy, and tests that make larger changes safe.' },
  { title: 'Useful every day', text: 'Bills, forecasts, integrations and AI that save typing, without taking decisions away from people.' },
];

const DECISIONS = [
  {
    title: 'One repository, one command',
    problem: 'Two separate apps with their own settings made setup slow and easy to get wrong.',
    decision: 'An npm workspaces monorepo with a single settings file. `npm run dev` creates the settings on first run and starts both apps; Docker Compose runs the database, API and web app together for production.',
  },
  {
    title: 'Data isolation designed in, then tested',
    problem: 'With teams added, a missed filter in one query could show one account another’s money.',
    decision: 'Every query on personal or team data goes through one scoping helper instead of hand-written checks. The tests sign in as a second account and confirm it gets “not found” for every type of record.',
  },
  {
    title: 'Money stored exactly',
    problem: 'Floating-point numbers drift by fractions of a cent, and stored totals go stale when an expense changes.',
    decision: 'Amounts are stored as DECIMAL. Remaining amounts and percentages are calculated when they are read, never stored, so they are always current.',
  },
  {
    title: 'Every database change is a migration',
    problem: 'A shared dump gives no history and no safe way to upgrade an existing install.',
    decision: `${PROJECT.migrations} versioned migrations build the schema and apply automatically on startup. An applied migration is never edited; changes always arrive as a new one.`,
  },
  {
    title: 'Sign-in that holds up in public',
    problem: 'A token handled by browser code is exposed to any script that runs on the page.',
    decision: 'Sessions live in httpOnly, SameSite cookies and end on every device when a password changes. Passwords use bcrypt, sign-in is rate limited, every request body is validated, and uploads are checked by their actual bytes.',
  },
  {
    title: 'Bills that connect to the budget',
    problem: 'A reminder that only shows a date doesn’t help you see what a bill does to your month.',
    decision: 'Bills can repeat weekly, monthly or yearly and keep their day of the month (a bill on the 31st returns to the 31st). Marking one paid can record the payment in a budget, all in one database transaction. Alerts use the person’s own date, not the server’s.',
  },
  {
    title: 'Integrations without new risks',
    problem: 'Imports, feeds and webhooks open new ways in and out of the system.',
    decision: 'Excel and CSV imports report errors row by row. Calendar and Sheets feeds use secret links stored only as hashes. Webhooks are signed with HMAC-SHA256 and can only reach public addresses, which blocks server-side request forgery.',
  },
  {
    title: 'AI that assists, without lock-in',
    problem: 'AI can save typing, but it costs money, providers change quickly, and it should never invent figures.',
    decision: `${PROJECT.aiProviders.join(', ')} sit behind one small interface, one file each. People use their own key, which is encrypted with AES-256-GCM and never sent back to the browser. The AI only fills in a form for the person to check, or explains figures the database has already calculated. Tests replace every provider, so they never call a real AI or spend money.`,
  },
  {
    title: 'A public demo that can’t be broken',
    problem: 'A shared demo account with a public password invites people to lock others out.',
    decision: 'Demo mode adds one-click sign-in, blocks password, email and invitation changes on the shared accounts, shows the demo admin only demo accounts, and rebuilds the demo every night with dates moved up to the current day.',
  },
];

const RESULTS = [
  `${PROJECT.endpoints} API endpoints, up from 63, with every request body validated.`,
  `${PROJECT.tests} automated tests that run on every push, up from none, including cross-account checks for every type of record.`,
  'Personal and team workspaces with owner, admin and member roles.',
  'Integrations with Excel, CSV, PDF, Google Sheets, calendar apps, Slack, Discord and signed webhooks.',
  `AI receipt scanning and monthly summaries with ${PROJECT.aiProviders.join(', ')}.`,
  `${PROJECT.currencies} currencies, a public demo mode and one-command setup.`,
];

const LESSONS = [
  { title: 'Tests change what you dare to change', text: 'Once the isolation tests existed, larger changes such as several budgets per month and linking transactions to budgets could be checked by the test suite in under a minute.' },
  { title: 'Security works best as one rule', text: 'One scoping helper, one validation layer and one error handler are easier to get right than many careful places.' },
  { title: 'Calculate, don’t store, what can be derived', text: 'Keeping only the raw amounts removed a whole class of “the totals don’t match” bugs.' },
  { title: 'Let AI assist, not decide', text: 'Keeping the numbers in the database and the person in charge of saving made the AI features safe to offer.' },
];

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="border-line scroll-mt-20 border-t py-14">
      <p className="text-accent-text text-sm font-medium">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-balance">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function CaseStudy() {
  const signedIn = useSelector((state) => Boolean(state.auth.user));

  return (
    <MarketingLayout
      title="Case study: rebuilding Budget Book — Budget Book"
      description={`How a 2023 university final-year project became an open-source, multi-user budgeting platform: the decisions, the trade-offs and the real figures, from 63 endpoints and no tests to ${PROJECT.endpoints} endpoints and ${PROJECT.tests} tests.`}
      path="/case-study"
    >
      <article className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
        <header>
          <p className="text-accent-text text-sm font-medium">Case study</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            From a final-year project to a production-ready budgeting platform
          </h1>
          <p className="text-ink-2 mt-5 text-lg leading-8 text-pretty">
            Budget Book started in {PROJECT.started} as a university team project. In {PROJECT.rebuilt} it was rebuilt into
            an open-source app that individuals and teams can trust with real money. This is how, and why.
          </p>

          <dl className="border-line mt-8 grid gap-4 rounded-xl border p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-ink-3">Project</dt>
              <dd className="mt-0.5 font-medium">University team project, rebuilt as open source</dd>
            </div>
            <div>
              <dt className="text-ink-3">Timeline</dt>
              <dd className="mt-0.5 font-medium">
                First version {PROJECT.started}–{PROJECT.firstVersionDone}; rebuilt {PROJECT.rebuilt}
              </dd>
            </div>
            <div>
              <dt className="text-ink-3">Platform</dt>
              <dd className="mt-0.5 font-medium">Web app, self-hosted, works on phones</dd>
            </div>
            <div>
              <dt className="text-ink-3">Code</dt>
              <dd className="mt-0.5">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-accent-text inline-flex items-center gap-1 font-medium">
                  <LuGithub className="size-4" aria-hidden="true" /> GitHub, {PROJECT.license} license
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-surface border-line rounded-xl border p-4">
                <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
                <p className="text-ink-3 mt-1 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </header>

        <Section id="starting-point" eyebrow="1 · The starting point" title="A working project with room to grow">
          <div className="text-ink-2 space-y-4 leading-7">
            <p>
              Between {PROJECT.started} and {PROJECT.firstVersionDone}, a university team built the first Budget Book: a React 18
              web app with Redux Toolkit and Tailwind CSS 3, and an Express 4 API on MySQL with 63 endpoints. It covered monthly
              budgets, daily and monthly expenses, categories, transactions, reminders, notes, bill splitting, reports and user
              administration.
            </p>
            <p>It did its job as a final-year project. To be something people could rely on every day, it needed more:</p>
          </div>
          <ul className="mt-4 space-y-2.5">
            {MISSING_IN_2023.map((item) => (
              <li key={item} className="text-ink-2 flex gap-3 text-sm leading-6">
                <span className="bg-ink-3 mt-2.5 size-1.5 shrink-0 rounded-full" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="goals" eyebrow="2 · Goals" title="What the rebuild had to achieve">
          <div className="grid gap-4 sm:grid-cols-2">
            {GOALS.map((goal) => (
              <div key={goal.title} className="bg-surface border-line rounded-xl border p-5">
                <h3 className="font-semibold">{goal.title}</h3>
                <p className="text-ink-2 mt-1.5 text-sm leading-6">{goal.text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="decisions" eyebrow="3 · Key decisions" title="Nine decisions that shaped the new version">
          <ol className="space-y-4">
            {DECISIONS.map((item, index) => (
              <li key={item.title} className="border-line rounded-xl border p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="bg-accent-soft text-accent-text tabular flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-ink-3 mt-2 text-sm leading-6">
                      <span className="text-ink-2 font-medium">The problem: </span>
                      {item.problem}
                    </p>
                    <p className="text-ink-2 mt-2 text-sm leading-6">
                      <span className="text-ink font-medium">What we did: </span>
                      {item.decision}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="then-and-now" eyebrow="4 · Then and now" title="The same project, three years apart">
          <div className="border-line overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-surface-2 text-ink-2">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium"></th>
                  <th scope="col" className="px-4 py-3 font-medium">2023</th>
                  <th scope="col" className="px-4 py-3 font-medium">{PROJECT.rebuilt}</th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {THEN_AND_NOW.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="px-4 py-3 font-medium">{row.label}</th>
                    <td className="text-ink-3 px-4 py-3">{row.then}</td>
                    <td className="px-4 py-3">{row.now}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="results" eyebrow="5 · Results" title="What the rebuild delivered">
          <ul className="space-y-3">
            {RESULTS.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6">
                <LuCircleCheck className="text-good mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <span className="text-ink-2">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-ink-3 bg-surface-2/60 mt-6 rounded-lg px-4 py-3 text-sm leading-6">
            Budget Book collects no analytics, so this case study reports what can be checked in the code, not user numbers.
            Every figure here can be verified in the public repository.
          </p>
        </Section>

        <Section id="lessons" eyebrow="6 · Lessons" title="What we learned">
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {LESSONS.map((lesson) => (
              <div key={lesson.title}>
                <h3 className="font-semibold">{lesson.title}</h3>
                <p className="text-ink-2 mt-1.5 text-sm leading-6">{lesson.text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="stack" eyebrow="7 · Technology" title="The stack today">
          <dl className="divide-line border-line divide-y rounded-xl border">
            {STACK.map((row) => (
              <div key={row.layer} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[10rem_1fr]">
                <dt className="font-medium">{row.layer}</dt>
                <dd className="text-ink-2">{row.items}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <section className="bg-surface border-line mt-6 rounded-2xl border px-6 py-10 text-center">
          <h2 className="text-xl font-semibold tracking-tight">See it for yourself</h2>
          <p className="text-ink-2 mx-auto mt-2 max-w-lg text-sm">Everything in this case study is in the app and the code.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {DEMO_MODE && !signedIn && <DemoButton />}
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={buttonClass(DEMO_MODE && !signedIn ? 'secondary' : 'primary')}>
              <LuGithub className="size-4" aria-hidden="true" /> Read the code
            </a>
            <Link to="/about" className={buttonClass('secondary')}>
              About Budget Book <LuArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </article>
    </MarketingLayout>
  );
}

export default CaseStudy;
