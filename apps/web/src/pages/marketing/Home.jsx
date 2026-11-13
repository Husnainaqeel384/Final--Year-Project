import { Link } from 'react-router-dom';
import {
  LuBell,
  LuBuilding2,
  LuCalendar,
  LuChartLine,
  LuFileSpreadsheet,
  LuFileText,
  LuReceipt,
  LuSheet,
  LuSplit,
  LuWallet,
  LuWebhook,
} from 'react-icons/lu';
import { buttonClass } from '../../components/ui/Button';
import { GITHUB_URL, MarketingLayout } from '../../components/layout/MarketingLayout';

const FEATURES = [
  { icon: LuWallet, title: 'Monthly budgets', text: 'Set income and savings goals, then plan every category before the month starts.' },
  { icon: LuReceipt, title: 'Expense tracking', text: 'Log spending in seconds and see what is left in each category as you go.' },
  { icon: LuChartLine, title: 'Spending forecast', text: 'Projects your month-end total from your pace so far, so you can adjust in time.' },
  { icon: LuSplit, title: 'Bill splitting', text: 'Split shared costs with a group and keep a clear history of who settled what.' },
  { icon: LuBell, title: 'Reminders and notes', text: 'Keep bill due dates and money notes next to the numbers they relate to.' },
  { icon: LuBuilding2, title: 'Teams and organizations', text: 'Share budgets with your team using owner, admin and member roles.' },
];

const INTEGRATIONS = [
  { icon: LuFileSpreadsheet, title: 'Excel and CSV', text: 'Import statements and export any data set.' },
  { icon: LuFileText, title: 'PDF reports', text: 'Download a clean monthly summary.' },
  { icon: LuSheet, title: 'Google Sheets', text: 'Keep a live sheet with IMPORTDATA.' },
  { icon: LuCalendar, title: 'Calendar feed', text: 'See reminders in Google, Outlook or Apple Calendar.' },
  { icon: LuWebhook, title: 'Slack, Discord, webhooks', text: 'Get alerts or connect Zapier and Make.' },
];

const FAQ = [
  { question: 'Is Budget Book free?', answer: 'Yes. Budget Book is open source under the MIT license and can be self-hosted at no cost.' },
  { question: 'Can a team or company use it?', answer: 'Yes. Every account has a personal workspace and can create organizations, where members share budgets, expenses and transactions with owner, admin or member roles.' },
  { question: 'Does it work with Excel?', answer: 'Yes. Transactions and expenses can be imported from Excel or CSV, and transactions, expenses and budgets can be exported to Excel or CSV. Monthly reports can be downloaded as PDF.' },
  { question: 'Where is my financial data stored?', answer: 'In your own MySQL database. Budget Book is self-hosted and does not send your data to a third party unless you turn on an integration.' },
];

function Home() {
  return (
    <MarketingLayout
      title="Budget Book — Open-source budget management for people and teams"
      description="Plan monthly budgets, track expenses, split bills and forecast spending. Free, open source and self-hostable, with Excel, Google Sheets, Slack and calendar integrations."
      path="/"
    >
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-24">
        <p className="text-accent-text text-sm font-medium">Free and open source</p>
        <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Know where your money goes before the month ends
        </h1>
        <p className="text-ink-2 mx-auto mt-5 max-w-xl text-lg text-pretty">
          Budget Book brings budgets, expenses, shared bills and forecasts together, for you or your
          whole team.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/register" className={buttonClass('primary')}>
            Create a free account
          </Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={buttonClass('secondary')}>
            View on GitHub
          </a>
        </div>
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
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Everything in one place</h2>
        <div className="mt-8 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <feature.icon className="text-accent-text size-5" aria-hidden="true" />
              <h3 className="mt-3 font-semibold">{feature.title}</h3>
              <p className="text-ink-2 mt-1 text-sm leading-6">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="integrations" className="bg-surface border-line scroll-mt-16 border-y">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Works with the tools you already use</h2>
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

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Questions</h2>
        <dl className="mt-8 space-y-7">
          {FAQ.map((item) => (
            <div key={item.question}>
              <dt className="font-semibold">{item.question}</dt>
              <dd className="text-ink-2 mt-1 text-sm leading-6">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </MarketingLayout>
  );
}

export default Home;
