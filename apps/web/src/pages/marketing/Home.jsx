import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  LuArrowRight,
  LuBellRing,
  LuBuilding2,
  LuCalendar,
  LuChartColumn,
  LuChartLine,
  LuCircleCheck,
  LuCoins,
  LuDatabase,
  LuEye,
  LuFileSpreadsheet,
  LuFileText,
  LuFlaskConical,
  LuGithub,
  LuKeyRound,
  LuLock,
  LuReceipt,
  LuScanLine,
  LuSheet,
  LuShieldCheck,
  LuSparkles,
  LuSplit,
  LuTriangleAlert,
  LuWallet,
  LuWebhook,
} from 'react-icons/lu';
import { buttonClass } from '../../components/ui/Button';
import { GITHUB_URL, MarketingLayout } from '../../components/layout/MarketingLayout';
import { DemoButton } from '../../components/auth/DemoButton';
import { DEMO_MODE, FEATURES as FLAGS } from '../../config/features';
import { PROJECT, THEN_AND_NOW } from '../../content/project';

const FEATURES = [
  { icon: LuWallet, title: 'Monthly budgets', text: 'Plan income, savings and every category. Keep several budgets a month, such as household and a trip, or copy last month to start fast.' },
  { icon: LuReceipt, title: 'Expenses and transactions', text: 'Log spending in seconds, search and filter it, and see what is left in each category as you go.' },
  { icon: LuChartLine, title: 'Forecasting', text: 'Projects your month-end total from your pace so far, and estimates next month from recent ones.' },
  { icon: LuBellRing, title: 'Bill reminders', text: 'Weekly, monthly or yearly bills with a top-bar alert before they are due. Mark one paid and it lands in your budget.' },
  { icon: LuChartColumn, title: 'Reports', text: 'Compare each month with the one before, then download it as Excel or PDF.' },
  { icon: LuBuilding2, title: 'Teams and organizations', text: 'Share budgets in an organization with owner, admin and member roles, separate from your personal money.' },
  ...(FLAGS.splitBills
    ? [{ icon: LuSplit, title: 'Bill splitting', text: 'Split shared costs with a group and keep a clear history of who settled what.' }]
    : []),
  { icon: LuCoins, title: `${PROJECT.currencies} currencies`, text: 'Pick the currency for yourself or for each organization from the top bar, and every page follows it.' },
  { icon: LuSparkles, title: 'AI assistant', text: 'Scan a receipt into an expense, or get a plain-language summary of any month, with your own AI key.' },
];

const STEPS = [
  { title: 'Plan the month', text: 'Set your income and savings goal, then give each category a limit. Copy last month to save time.' },
  { title: 'Track as you spend', text: 'Add expenses by hand, import them from a spreadsheet, or scan a receipt. Bills remind you before they are due.' },
  { title: 'Review and adjust', text: 'The dashboard shows what is left and where the month is heading, so you can change course early.' },
];

const INTEGRATIONS = [
  { icon: LuFileSpreadsheet, title: 'Excel and CSV', text: 'Import transactions and expenses, and export any data set.' },
  { icon: LuFileText, title: 'PDF reports', text: 'Download a clean monthly summary.' },
  { icon: LuSheet, title: 'Google Sheets', text: 'Keep a live sheet with IMPORTDATA.' },
  { icon: LuCalendar, title: 'Calendar feed', text: 'See bills in Google, Outlook or Apple Calendar.' },
  { icon: LuWebhook, title: 'Slack, Discord, webhooks', text: 'Get alerts or connect Zapier and Make.' },
];

const SECURITY = [
  { icon: LuDatabase, title: 'Your database, your data', text: 'Budget Book is self-hosted. Your records live in your own MySQL database, not with us.' },
  { icon: LuShieldCheck, title: 'Accounts kept apart', text: 'Every query is limited to the signed-in person or team, and automated tests check that other accounts can’t reach it.' },
  { icon: LuKeyRound, title: 'AI keys encrypted', text: 'Provider keys are encrypted before they are stored and never shown again, only their last four characters.' },
  { icon: LuLock, title: 'Safe sign-in', text: 'Sessions use httpOnly cookies, end on a password change, and sign-in attempts are rate limited.' },
  { icon: LuEye, title: 'No tracking', text: 'One essential cookie keeps you signed in. There are no advertising or analytics cookies.' },
  { icon: LuFlaskConical, title: 'Tested', text: `${PROJECT.tests} automated tests run on every push, including the checks that keep accounts apart.` },
];

const FAQ = [
  { question: 'Is Budget Book free?', answer: 'Yes. It is open source under the MIT license and can be self-hosted at no cost.' },
  { question: 'Can a team or company use it?', answer: 'Yes. Every account has a personal workspace and can create organizations, where members share budgets, expenses and transactions with owner, admin or member roles.' },
  { question: 'How does the AI work, and what does it cost?', answer: `You connect your own ${PROJECT.aiProviders.join(', ')} API key in Settings, so requests are billed to your account with that provider, usually a few cents or less each. The AI only fills in forms for you to check and explains figures calculated from your own records; it never saves anything by itself.` },
  { question: 'Does it work with Excel?', answer: 'Yes. Transactions and expenses can be imported from Excel or CSV, and transactions, expenses and budgets can be exported. Monthly reports can be downloaded as PDF.' },
  { question: 'Where is my financial data stored?', answer: 'In your own MySQL database. Nothing is sent to a third party unless you turn on an integration or use an AI feature, which sends only that request to the provider you chose.' },
  { question: 'Who made Budget Book?', answer: `It began in ${PROJECT.started} as a university final-year project built by a team, and was rebuilt in ${PROJECT.rebuilt} into the open-source app it is today. The About page and the case study tell the full story.` },
];

function SectionHeading({ eyebrow, title, text, center = false }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <p className="text-accent-text text-sm font-medium">{eyebrow}</p>}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>
      {text && <p className="text-ink-2 mt-3 text-pretty">{text}</p>}
    </div>
  );
}

/** Static pictures of the two AI features. The figures are examples, not live data. */
function AiPreview() {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <div className="border-line bg-page rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium">
          <LuScanLine className="text-accent-text size-4" /> Receipt scanned
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {[
            ['Amount', '$42.50'],
            ['Date', '14 Mar'],
            ['Category', 'Groceries'],
            ['Description', 'Maple Grocers'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-ink-3 text-xs">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="bg-accent-soft/60 text-ink-2 mt-3 rounded-md px-2.5 py-1.5 text-xs">Check each field, then save.</p>
      </div>
      <div className="border-line bg-page rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium">
          <LuSparkles className="text-accent-text size-4" /> AI summary of March
        </div>
        <p className="mt-2 text-sm font-medium">Spending is on pace, but Dining Out is already over plan.</p>
        <ul className="text-ink-2 mt-2 space-y-1.5 text-xs">
          <li className="flex gap-2">
            <LuTriangleAlert className="text-warning size-3.5 shrink-0" /> Dining Out is at 114% of its $280.00 plan.
          </li>
          <li className="flex gap-2">
            <LuCircleCheck className="text-good size-3.5 shrink-0" /> Groceries came in $24.80 under plan.
          </li>
        </ul>
      </div>
    </div>
  );
}

function Home() {
  const signedIn = useSelector((state) => Boolean(state.auth.user));
  const showDemo = DEMO_MODE && !signedIn;

  const primaryActions = (
    <>
      {showDemo && <DemoButton />}
      <Link to="/register" className={buttonClass(showDemo ? 'secondary' : 'primary')}>
        Create a free account
      </Link>
    </>
  );

  return (
    <MarketingLayout
      title="Budget Book — Open-source budget management for people and teams"
      description="Plan monthly budgets, track expenses, get bill reminders, forecast spending and use AI to scan receipts. Free, open source and self-hostable, with Excel, Google Sheets, Slack and calendar integrations."
      path="/"
    >
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-24">
        <p className="text-accent-text text-sm font-medium">Free · Open source · Self-hosted</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Know where your money goes before the month ends
        </h1>
        <p className="text-ink-2 mx-auto mt-5 max-w-xl text-lg text-pretty">
          Budget Book brings budgets, expenses, bill reminders, forecasts and an AI assistant together, for you or your
          whole team.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {primaryActions}
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={buttonClass('secondary')}>
            <LuGithub className="size-4" aria-hidden="true" /> View on GitHub
          </a>
        </div>
        <ul className="text-ink-2 mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {[`${PROJECT.license} licensed`, 'Your data stays in your database', `${PROJECT.tests} automated tests`].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <LuCircleCheck className="text-good size-4" aria-hidden="true" /> {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6" aria-label="Product preview">
        <img
          src="/dashboard-preview.png"
          alt="Budget Book dashboard showing money left to spend, a forecast, income against spending by month, and spending by category"
          width="1440"
          height="900"
          className="border-line w-full rounded-xl border shadow-xl"
        />
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Features"
          title="Everything your money needs, in one place"
          text="From planning the month to paying the last bill, each part works with the others: a paid reminder becomes a transaction, which counts against your budget, which updates your forecast."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="border-line bg-surface rounded-xl border p-5">
              <span className="bg-accent-soft text-accent-text flex size-9 items-center justify-center rounded-lg">
                <feature.icon className="size-[18px]" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="text-ink-2 mt-1.5 text-sm leading-6">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ai" className="bg-surface border-line scroll-mt-16 border-y">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="AI assistant"
              title="Let AI do the typing, not the deciding"
              text="Two everyday jobs, done with your own AI account. You stay in control of every number."
            />
            <ul className="mt-6 space-y-4">
              <li className="flex gap-3">
                <LuScanLine className="text-accent-text mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">Scan a receipt</p>
                  <p className="text-ink-2 text-sm leading-6">Upload a photo and the expense form fills itself in: amount, date, shop and category. You check it and save.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <LuSparkles className="text-accent-text mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">Explain the month</p>
                  <p className="text-ink-2 text-sm leading-6">A short summary of where the money went and what to watch. The figures come from your records; the AI only explains them.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <LuKeyRound className="text-accent-text mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-medium">Your key, your choice of AI</p>
                  <p className="text-ink-2 text-sm leading-6">Works with {PROJECT.aiProviders.join(', ')}. Your key is encrypted and you pay the provider directly, usually a few cents or less per request.</p>
                </div>
              </li>
            </ul>
          </div>
          <AiPreview />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="How it works" title="Three steps, every month" center />
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-line rounded-xl border p-6">
              <span className="bg-accent tabular flex size-8 items-center justify-center rounded-full text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="text-ink-2 mt-1.5 text-sm leading-6">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="integrations" className="bg-surface border-line scroll-mt-16 border-y">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Integrations" title="Works with the tools you already use" />
          <ul className="divide-line mt-8 divide-y">
            {INTEGRATIONS.map((item) => (
              <li key={item.title} className="flex items-center gap-4 py-4">
                <item.icon className="text-ink-2 size-5 shrink-0" aria-hidden="true" />
                <span className="w-56 shrink-0 font-medium">{item.title}</span>
                <span className="text-ink-2 hidden text-sm sm:block">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Security and privacy"
          title="Built to be trusted with money"
          text="Financial data deserves care. These protections are part of the code, and the automated tests check them on every push."
        />
        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY.map((item) => (
            <div key={item.title} className="flex gap-3">
              <item.icon className="text-good mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-ink-2 mt-1 text-sm leading-6">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="bg-surface border-line scroll-mt-16 border-y">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="About us" title="From a university project to an open-source platform" />
            <div className="text-ink-2 mt-4 space-y-4 leading-7">
              <p>
                Budget Book began in {PROJECT.started} as a university final-year project on budget management, designed and
                built by a team of students.
              </p>
              <p>
                In {PROJECT.rebuilt} it was rebuilt from the ground up for people, households and small teams: shared
                workspaces, integrations, an AI assistant and the safeguards real financial data needs. It stays free and
                open source, and you can run it on your own server.
              </p>
            </div>
            <Link to="/about" className="text-accent-text mt-6 inline-flex items-center gap-1.5 font-medium">
              Read our story <LuArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ol className="border-line relative space-y-8 border-l pl-6">
            {[
              [PROJECT.started, 'The project starts', 'A university team begins Budget Book as its final-year project.'],
              [PROJECT.firstVersionDone, 'First version', 'The first version covers budgets, expenses, transactions, reminders, notes and reports.'],
              [PROJECT.rebuilt, 'Rebuilt for real use', 'Teams, integrations, tests, Docker, a public demo and an AI assistant.'],
            ].map(([when, title, text]) => (
              <li key={title} className="relative">
                <span className="bg-accent ring-surface absolute top-1.5 -left-[31px] size-3 rounded-full ring-4" aria-hidden="true" />
                <p className="text-accent-text text-sm font-medium">{when}</p>
                <p className="mt-0.5 font-semibold">{title}</p>
                <p className="text-ink-2 mt-1 text-sm leading-6">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="case-study" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Case study"
            title="What changed when we rebuilt it"
            text="The first version did its job as a university project. The rebuild made it safe, testable and ready for teams. These figures come straight from the code, then and now."
          />
          <Link to="/case-study" className={buttonClass('secondary')}>
            Read the case study <LuArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {THEN_AND_NOW.slice(0, 4).map((row) => (
            <div key={row.label} className="border-line bg-surface rounded-xl border p-5">
              <p className="text-ink-3 text-[13px]">{row.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{row.now}</p>
              <p className="text-ink-3 mt-1 text-xs">In 2023: {row.then}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="bg-surface border-line scroll-mt-16 border-y">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="FAQ" title="Questions" />
          <dl className="mt-8 space-y-7">
            {FAQ.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold">{item.question}</dt>
                <dd className="text-ink-2 mt-1 text-sm leading-6">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="bg-accent relative overflow-hidden rounded-2xl px-6 py-14 text-center text-white sm:px-12">
          <div className="absolute -top-20 -right-20 size-64 rounded-full bg-white/10" aria-hidden="true" />
          <h2 className="relative text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Start planning next month today</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/85">Free, open source and ready in minutes. Bring your team, or keep it just for you.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            {showDemo && <DemoButton variant="secondary">Try the live demo</DemoButton>}
            <Link to="/register" className={buttonClass('secondary')}>
              Create a free account
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

export default Home;
