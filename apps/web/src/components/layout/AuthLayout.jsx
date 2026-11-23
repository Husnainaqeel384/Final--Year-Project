import { LuCircleAlert, LuCircleCheck } from 'react-icons/lu';
import { Brand } from './Brand';

const HIGHLIGHTS = [
  'Monthly budgets that show what is left to spend',
  'Reminders before bills are due, so nothing is missed',
  'Shared workspaces for teams, with roles',
  'Excel, Google Sheets, Slack and calendar integrations',
];

/** A small, static picture of the dashboard. The figures are illustrative only. */
function PreviewCard() {
  return (
    <div className="bg-surface text-ink w-full max-w-sm rounded-xl p-5 shadow-2xl" aria-hidden="true">
      <p className="text-ink-3 text-xs">Left to spend this month</p>
      <p className="tabular mt-1 text-3xl font-semibold tracking-tight">$1,257.93</p>
      <div className="bg-accent-soft mt-3 h-2 overflow-hidden rounded-full">
        <div className="bg-accent h-full w-[73%] rounded-full" />
      </div>
      <p className="text-ink-3 mt-1.5 text-xs">73% of $4,705.00 planned</p>
      <div className="border-line mt-4 space-y-2.5 border-t pt-4 text-sm">
        <div className="flex items-center gap-2">
          <LuCircleAlert className="text-critical size-4 shrink-0" />
          <span className="flex-1">Internet bill</span>
          <span className="text-critical text-xs">2 days overdue</span>
        </div>
        <div className="flex items-center gap-2">
          <LuCircleCheck className="text-good size-4 shrink-0" />
          <span className="flex-1">Rent</span>
          <span className="text-ink-3 text-xs">Paid</span>
        </div>
      </div>
    </div>
  );
}

function ProductPanel() {
  return (
    <aside className="bg-accent relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-center lg:px-12 xl:px-16">
      {/* Soft circles keep the flat colour from looking empty; purely decorative. */}
      <div className="absolute -top-24 -right-24 size-80 rounded-full bg-white/10" aria-hidden="true" />
      <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-white/5" aria-hidden="true" />

      <div className="relative max-w-md">
        <h2 className="text-3xl font-semibold tracking-tight text-balance">Know where your money goes before the month ends</h2>
        <ul className="mt-6 space-y-3 text-[15px] text-white/90">
          {HIGHLIGHTS.map((text) => (
            <li key={text} className="flex items-start gap-2.5">
              <LuCircleCheck className="mt-0.5 size-5 shrink-0 text-white" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <PreviewCard />
        </div>
      </div>
    </aside>
  );
}

export function AuthLayout({ title, subtitle, pageTitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <title>{`${pageTitle ?? title} — Budget Book`}</title>

      <main className="flex flex-col px-4 py-6 sm:px-8 lg:px-12">
        <Brand />
        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-ink-2 mt-1.5 text-sm">{subtitle}</p>}
            <div className="mt-6">{children}</div>
            {footer && <p className="text-ink-2 mt-6 text-center text-sm">{footer}</p>}
          </div>
        </div>
      </main>

      <ProductPanel />
    </div>
  );
}
