import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  LuArrowRight,
  LuBellRing,
  LuBriefcase,
  LuBuilding2,
  LuChartLine,
  LuCode,
  LuEye,
  LuGithub,
  LuHeartHandshake,
  LuHouse,
  LuPlug,
  LuReceipt,
  LuShieldCheck,
  LuSparkles,
  LuUsers,
  LuWallet,
} from 'react-icons/lu';
import { buttonClass } from '../../components/ui/Button';
import { GITHUB_URL, MarketingLayout } from '../../components/layout/MarketingLayout';
import { DemoButton } from '../../components/auth/DemoButton';
import { DEMO_MODE } from '../../config/features';
import { PROJECT } from '../../content/project';

const TIMELINE = [
  { when: PROJECT.started, title: 'A final-year project begins', text: 'A university team starts Budget Book as its final-year project on budget management.' },
  { when: PROJECT.firstVersionDone, title: 'The first version', text: 'Monthly budgets, daily and monthly expenses, categories, transactions, reminders, notes, bill splitting and reports, in a React and Express app on MySQL.' },
  { when: PROJECT.rebuilt, title: 'Rebuilt for real use', text: 'A new foundation: shared team workspaces, versioned database migrations, safer sign-in, integrations, Docker and over a hundred automated tests.' },
  { when: `Late ${PROJECT.rebuilt}`, title: 'Bills, demo and AI', text: 'Bills that repeat and alert you before they are due, a public demo anyone can try, and an AI assistant that works with your own key.' },
];

const VALUES = [
  { icon: LuChartLine, title: 'Know before, not after', text: 'A budget is only useful while there is still time to act. Forecasts and alerts show where the month is heading while you can still change it.' },
  { icon: LuShieldCheck, title: 'Your data stays yours', text: 'Budget Book runs on your own server and database, so your numbers stay where you put them. There is no tracking.' },
  { icon: LuCode, title: 'Open by default', text: `Every line of code is public under the ${PROJECT.license} license. You can read it, run it, change it and check every claim we make.` },
  { icon: LuUsers, title: 'Simple for one, structured for many', text: 'One person can use it alone; a team gets shared workspaces with clear roles, in the same app.' },
  { icon: LuSparkles, title: 'AI that assists, never decides', text: 'AI saves typing and explains your month, but every figure comes from your records and nothing is saved without you.' },
];

const AUDIENCES = [
  { icon: LuHouse, title: 'Individuals and households', text: 'Plan the month, keep bills on time, and see early when a category is running out.' },
  { icon: LuBriefcase, title: 'Freelancers', text: 'Track income and spending, import transactions from an Excel or CSV template, and keep separate budgets for work and home.' },
  { icon: LuBuilding2, title: 'Small teams and companies', text: 'Share budgets in an organization, give owners, admins and members the right access, and report each month.' },
  { icon: LuCode, title: 'Developers and self-hosters', text: 'Run it with one command or Docker, connect it with webhooks, and adapt the open code to your needs.' },
];

const INSIDE = [
  { icon: LuWallet, title: 'Planning', text: 'Monthly budgets with income, a savings goal and category limits; several budgets in one month; copy last month to start fast.' },
  { icon: LuReceipt, title: 'Tracking', text: 'Expenses and transactions with search, filters and pagination; imports from Excel and CSV; 20 currencies.' },
  { icon: LuBellRing, title: 'Bills', text: 'Weekly, monthly or yearly reminders, alerts in the top bar and on the dashboard, and payments that go straight into a budget.' },
  { icon: LuChartLine, title: 'Insight', text: 'A dashboard of what is left, a month-end forecast, a 12-month trend and month-by-month reports as Excel or PDF.' },
  { icon: LuBuilding2, title: 'Teams', text: 'Personal and organization workspaces, email invitations, and owner, admin and member roles.' },
  { icon: LuPlug, title: 'Integrations', text: 'Google Sheets and calendar feeds, Slack and Discord alerts, and signed webhooks for Zapier, Make or your own tools.' },
  { icon: LuSparkles, title: 'AI assistant', text: `Receipt scanning and monthly summaries with ${PROJECT.aiProviders.join(', ')}, using your own encrypted key.` },
];

const DATA_PRACTICES = [
  'Your records are stored in your own MySQL database. Budget Book has no central server that collects them.',
  'One essential cookie keeps you signed in. There are no advertising or analytics cookies.',
  'Emails are sent only for password resets and team invitations, and only if the server has email set up.',
  'Nothing leaves your server unless you turn on an integration, use an AI feature, or the server sends one of those emails.',
  'An AI request sends only what that task needs: a receipt photo with your category names, or one month’s figures (income, plan and spending by category, and the month before). Your provider key is encrypted at rest and never shown again.',
  'Accounts are kept apart in every query, and automated tests check that one account can’t reach another’s data.',
];

function Heading({ eyebrow, title, text }) {
  return (
    <div className="max-w-2xl">
      <p className="text-accent-text text-sm font-medium">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>
      {text && <p className="text-ink-2 mt-3 text-pretty">{text}</p>}
    </div>
  );
}

function About() {
  const signedIn = useSelector((state) => Boolean(state.auth.user));
  const showDemo = DEMO_MODE && !signedIn;

  return (
    <MarketingLayout
      title="About us — Budget Book"
      description="Budget Book is a free, open-source budgeting app for people and teams. It began in 2023 as a university final-year project and was rebuilt in 2026. Our story, mission, values and how we handle your data."
      path="/about"
    >
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-14 sm:px-6 sm:pt-24">
        <p className="text-accent-text text-sm font-medium">About us</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Clear money decisions for everyone who shares a budget
        </h1>
        <p className="text-ink-2 mt-5 max-w-2xl text-lg leading-8 text-pretty">
          Budget Book is a free, open-source app for planning budgets, tracking spending and keeping bills on time, for
          one person, a household or a whole team. You run it yourself, so your financial data stays with you.
        </p>
      </section>

      <section className="bg-surface border-line border-y">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Heading eyebrow="Our story" title="From a classroom project to an open-source platform" />
            <div className="text-ink-2 mt-5 space-y-4 leading-7">
              <p>
                Budget Book began in {PROJECT.started} as a university final-year project on budget management, designed
                and built by a team of students.
              </p>
              <p>
                By {PROJECT.firstVersionDone} the first version could plan monthly budgets, record daily and monthly
                expenses, keep reminders and notes, split bills, produce reports and let an administrator manage users.
              </p>
              <p>
                In {PROJECT.rebuilt}, Budget Book was rebuilt from the ground up so it could be trusted with real money and
                used by teams. The new version added shared workspaces, exact money handling, safer sign-in, integrations
                with everyday tools, a public demo and an AI assistant, all backed by automated tests.
              </p>
              <p>
                Today it is a complete open-source platform that anyone can run on their own server, free of charge.
              </p>
            </div>
            <Link to="/case-study" className="text-accent-text mt-6 inline-flex items-center gap-1.5 font-medium">
              Read the full case study <LuArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <ol className="border-line relative space-y-8 self-center border-l pl-6">
            {TIMELINE.map((item) => (
              <li key={item.title} className="relative">
                <span className="bg-accent ring-surface absolute top-1.5 -left-[31px] size-3 rounded-full ring-4" aria-hidden="true" />
                <p className="text-accent-text text-sm font-medium">{item.when}</p>
                <p className="mt-0.5 font-semibold">{item.title}</p>
                <p className="text-ink-2 mt-1 text-sm leading-6">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="bg-accent-soft/50 border-accent-soft rounded-2xl border px-6 py-10 sm:px-10">
          <p className="text-accent-text text-sm font-medium">Our mission</p>
          <p className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Help people and teams see where their money is going early enough to change it, with tools they own and can
            trust.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Heading eyebrow="What we believe" title="The principles behind every feature" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="border-line bg-surface rounded-xl border p-5">
              <value.icon className="text-accent-text size-5" aria-hidden="true" />
              <h3 className="mt-3 font-semibold">{value.title}</h3>
              <p className="text-ink-2 mt-1.5 text-sm leading-6">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface border-line border-y">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Heading eyebrow="Who it's for" title="Built for anyone who plans with money" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((audience) => (
              <div key={audience.title}>
                <span className="bg-accent-soft text-accent-text flex size-10 items-center justify-center rounded-lg">
                  <audience.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold">{audience.title}</h3>
                <p className="text-ink-2 mt-1.5 text-sm leading-6">{audience.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Heading eyebrow="What's inside" title="One app for the whole money routine" />
        <dl className="divide-line border-line mt-10 divide-y rounded-xl border">
          {INSIDE.map((item) => (
            <div key={item.title} className="grid gap-2 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
              <dt className="flex items-center gap-2.5 font-medium">
                <item.icon className="text-accent-text size-4 shrink-0" aria-hidden="true" /> {item.title}
              </dt>
              <dd className="text-ink-2 text-sm leading-6">{item.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-surface border-line border-y">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <Heading
              eyebrow="Your data"
              title="How we handle your financial data"
              text="Money is personal. These are the commitments built into the code, and you can verify each one in the repository."
            />
            <Link to="/privacy" className="text-accent-text mt-6 inline-flex items-center gap-1.5 font-medium">
              Read the privacy policy <LuArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="space-y-4">
            {DATA_PRACTICES.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6">
                <LuEye className="text-good mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span className="text-ink-2">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Heading eyebrow="Open source" title="Built in the open" />
            <div className="text-ink-2 mt-5 space-y-4 leading-7">
              <p>
                Budget Book is released under the {PROJECT.license} license. You can use it for yourself, your family or your
                business, change it, and share your changes.
              </p>
              <p>
                Bug reports, ideas and pull requests are welcome on GitHub. If you find a security problem, please report it
                privately as described in the security policy rather than in a public issue.
              </p>
            </div>
          </div>
          <div className="grid content-start gap-3">
            <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer" className="border-line hover:bg-surface flex items-center gap-3 rounded-xl border p-4">
              <LuGithub className="size-5 shrink-0" aria-hidden="true" />
              <span className="flex-1">
                <span className="block font-medium">Report a bug or suggest a feature</span>
                <span className="text-ink-3 text-sm">Open an issue on GitHub</span>
              </span>
              <LuArrowRight className="text-ink-3 size-4" aria-hidden="true" />
            </a>
            <a href={`${GITHUB_URL}/blob/master/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="border-line hover:bg-surface flex items-center gap-3 rounded-xl border p-4">
              <LuHeartHandshake className="size-5 shrink-0" aria-hidden="true" />
              <span className="flex-1">
                <span className="block font-medium">Contribute code</span>
                <span className="text-ink-3 text-sm">Read the contributing guide</span>
              </span>
              <LuArrowRight className="text-ink-3 size-4" aria-hidden="true" />
            </a>
            <a href={`${GITHUB_URL}/blob/master/SECURITY.md`} target="_blank" rel="noreferrer" className="border-line hover:bg-surface flex items-center gap-3 rounded-xl border p-4">
              <LuShieldCheck className="size-5 shrink-0" aria-hidden="true" />
              <span className="flex-1">
                <span className="block font-medium">Report a security problem</span>
                <span className="text-ink-3 text-sm">Follow the private reporting steps</span>
              </span>
              <LuArrowRight className="text-ink-3 size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="bg-accent relative overflow-hidden rounded-2xl px-6 py-14 text-center text-white sm:px-12">
          <div className="absolute -top-20 -left-20 size-64 rounded-full bg-white/10" aria-hidden="true" />
          <h2 className="relative text-2xl font-semibold tracking-tight text-balance sm:text-3xl">See Budget Book in action</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/85">Create a free account, or look around a ready-made one first.</p>
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

export default About;
