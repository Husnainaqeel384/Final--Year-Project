import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  LuArrowDownLeft,
  LuArrowDownRight,
  LuArrowUpRight,
  LuBell,
  LuCircleCheck,
  LuClock,
  LuPlus,
  LuTriangleAlert,
  LuWallet,
} from 'react-icons/lu';
import { fetchDashboard } from '../../api/financeApi';
import { getErrorMessage } from '../../api/client';
import { setData, setError, setLoading } from '../../redux/features/dashboardSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import {
  currentMonth,
  daysUntil,
  describeDue,
  formatDate,
  formatMoney,
  formatMoneyCompact,
  formatMonth,
} from '../../lib/format';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge, EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import { BudgetStatusLabel, Meter } from '../../components/ui/Meter';
import { buttonClass } from '../../components/ui/Button';
import { CashFlowChart } from '../../components/charts/Charts';
import { Sparkline } from '../../components/charts/Sparkline';
import { CategoryBreakdown } from '../../components/charts/CategoryBreakdown';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function ViewAll({ to }) {
  return (
    <Link to={to} className="text-accent-text text-[13px] font-medium whitespace-nowrap">
      View all
    </Link>
  );
}

function StatTile({ label, value, trend, children }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-ink-2 text-[13px]">{label}</p>
        {trend && <Sparkline values={trend} />}
      </div>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      <div className="text-ink-3 mt-auto pt-2 text-xs">{children}</div>
    </Card>
  );
}

/** More spending than last month is the bad direction, so the colours are the reverse of a usual "up". */
function SpendDelta({ percent, partial }) {
  if (percent === null) return 'No data for last month';
  const up = percent > 0;
  const Icon = up ? LuArrowUpRight : LuArrowDownRight;
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-flex items-center font-medium ${up ? 'text-critical' : 'text-good'}`}>
        <Icon className="size-3.5" aria-hidden="true" />
        {Math.abs(percent).toFixed(1)}%
      </span>
      {partial ? 'so far vs last month' : 'vs last month'}
    </span>
  );
}

/** Icon and words carry the meaning, so it never depends on colour vision. */
function SavingsStatus({ projected, goal, currency }) {
  if (goal <= 0) return 'No savings goal set';
  const onTrack = projected >= goal;
  const Icon = onTrack ? LuCircleCheck : LuTriangleAlert;
  return (
    <span className={`inline-flex items-center gap-1 ${onTrack ? 'text-good' : 'text-warning'}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {onTrack ? 'On track for' : 'Below'} your {formatMoney(goal, currency)} goal
    </span>
  );
}

function HeroCard({ data, currency }) {
  const { kpis, forecast } = data;
  const spentPercent = kpis.planned > 0 ? (kpis.spent / kpis.planned) * 100 : 0;
  const projectedPercent = kpis.planned > 0 ? (forecast.projectedSpend / kpis.planned) * 100 : 0;
  const overrun = forecast.projectedSpend - kpis.planned;
  const showForecast = forecast.isCurrentMonth && kpis.planned > 0;

  return (
    <Card className="flex flex-col p-6 lg:col-span-2">
      <p className="text-ink-2 text-sm">
        Left to spend in {formatMonth(data.month)}
        {data.budgetCount > 1 && <span className="text-ink-3"> · across {data.budgetCount} budgets</span>}
      </p>
      <p className="mt-2 text-5xl font-semibold tracking-tight">{formatMoney(kpis.remaining, currency)}</p>
      <p className="text-ink-3 mt-2 text-sm">
        {formatMoney(kpis.spent, currency)} spent of {formatMoney(kpis.planned, currency)} planned
      </p>

      <div className="mt-6">
        {/* The track is a lighter step of the fill's own hue, so the whole bar reads as one budget. */}
        <div className="relative">
          <div
            role="progressbar"
            aria-label="Budget used"
            aria-valuenow={Math.round(spentPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="bg-accent-soft h-2.5 overflow-hidden rounded-full"
          >
            <div className="bg-accent h-full rounded-full" style={{ width: `${Math.min(spentPercent, 100)}%` }} />
          </div>
          {showForecast && (
            <span
              aria-hidden="true"
              className="bg-ink absolute -top-1 h-[18px] w-0.5 rounded-full"
              style={{ left: `calc(${Math.min(projectedPercent, 100)}% - 1px)` }}
            />
          )}
        </div>
        <div className="text-ink-3 mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-accent size-2 rounded-full" /> {spentPercent.toFixed(0)}% used
          </span>
          {showForecast && (
            <span className="inline-flex items-center gap-1.5">
              <span className="bg-ink h-3 w-0.5 rounded-full" /> Projected by month end
            </span>
          )}
        </div>
      </div>

      {showForecast && (
        <p className="border-line text-ink-2 mt-auto border-t pt-4 text-sm">
          At {formatMoney(forecast.dailyAverage, currency)} a day you'll spend about{' '}
          <span className="text-ink font-medium">{formatMoney(forecast.projectedSpend, currency)}</span> this month,{' '}
          {overrun > 0 ? (
            <span className="text-warning font-medium">{formatMoney(overrun, currency)} over plan</span>
          ) : (
            <span className="text-good font-medium">{formatMoney(-overrun, currency)} under plan</span>
          )}
          .
        </p>
      )}
    </Card>
  );
}

const TRANSACTION_STYLES = {
  received: { icon: LuArrowDownLeft, tone: 'bg-good-soft text-good', sign: '+', label: 'Received' },
  sent: { icon: LuArrowUpRight, tone: 'bg-surface-2 text-ink-2', sign: '−', label: 'Sent' },
  pending: { icon: LuClock, tone: 'bg-warning-soft text-warning', sign: '', label: 'Pending' },
};

function TransactionRow({ item, currency }) {
  const style = TRANSACTION_STYLES[item.type];
  return (
    <li className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${style.tone}`}>
        <style.icon className="size-4" aria-label={style.label} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.type === 'received' ? item.sender : item.receiver}</p>
        <p className="text-ink-3 truncate text-xs">
          {formatDate(item.date)} · {item.method}
        </p>
      </div>
      <span className={`tabular text-sm font-medium ${item.type === 'received' ? 'text-good' : ''}`}>
        {style.sign}
        {formatMoney(item.amount, currency)}
      </span>
    </li>
  );
}

function ReminderRow({ item }) {
  const days = daysUntil(item.dueDate);
  const tone = days < 0 ? 'critical' : days <= 3 ? 'warning' : 'neutral';
  return (
    <li className="flex items-center gap-3">
      <span className="bg-surface-2 text-ink-2 flex size-9 shrink-0 items-center justify-center rounded-full">
        <LuBell className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="text-ink-3 text-xs">{formatDate(item.dueDate)}</p>
      </div>
      <Badge tone={tone}>{describeDue(item.dueDate)}</Badge>
    </li>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <Skeleton className="h-64 lg:col-span-2" />
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
      <Skeleton className="h-96 lg:col-span-3" />
      <Skeleton className="h-96" />
    </div>
  );
}

function Dashboard() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.dashboard);
  const firstName = useSelector((state) => state.auth.user?.firstName);
  const { activeId, organization, currency, canManage } = useWorkspace();
  const [month, setMonth] = useState(currentMonth());

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      dispatch(setData(await fetchDashboard(month)));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
    // activeId: the workspace header changes the response, so a switch must refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, month, activeId]);

  useEffect(() => {
    load();
  }, [load]);

  const header = (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-ink-3 text-sm">{organization ? organization.name : 'Personal workspace'}</p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
          {greeting()}
          {firstName ? `, ${firstName}` : ''}
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="month"
          aria-label="Month"
          value={month}
          onChange={(event) => event.target.value && setMonth(event.target.value)}
          className="border-line bg-surface h-10 rounded-lg border px-3 text-sm"
        />
        <Link to="/app/expenses?new=1" className={buttonClass('primary')}>
          <LuPlus className="size-4" aria-hidden="true" /> Add expense
        </Link>
      </div>
    </div>
  );

  if (error && !data) {
    return (
      <>
        <title>Dashboard — Budget Book</title>
        {header}
        <Card>
          <ErrorState message={error} onRetry={load} />
        </Card>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <title>Dashboard — Budget Book</title>
        {header}
        <DashboardSkeleton />
      </>
    );
  }

  const { kpis, forecast, trend, categories, reminders, transactions } = data;
  // A bill paid exactly in full (rent, insurance) can't run over, so it isn't worth watching.
  const watchList = [...categories]
    .filter((item) => item.planned > 0 && item.percentUsed !== 100)
    .sort((a, b) => b.percentUsed - a.percentUsed)
    .slice(0, 5);
  const projectedSavings = kpis.income - (forecast.isCurrentMonth ? forecast.projectedSpend : kpis.spent);
  const yearIncome = trend.reduce((sum, point) => sum + point.income, 0);
  const yearSpent = trend.reduce((sum, point) => sum + point.spent, 0);

  return (
    <>
      <title>Dashboard — Budget Book</title>
      {header}
      {/* Previous numbers stay visible while refetching so the layout never jumps. */}
      <div className={`space-y-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
        {!data.hasBudget && (
          <Card>
            <EmptyState
              icon={LuWallet}
              title={`No budget for ${formatMonth(data.month)}`}
              description="Create a budget to plan your categories and see what's left as you spend."
              action={
                canManage && (
                  <Link to="/app/budgets?new=1" className={buttonClass('primary')}>
                    Create budget
                  </Link>
                )
              }
            />
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HeroCard data={data} currency={currency} />
          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2 lg:col-span-2">
            <StatTile label="Income" value={formatMoney(kpis.income, currency)} trend={trend.map((point) => point.income)}>
              This month
            </StatTile>
            <StatTile label="Spent" value={formatMoney(kpis.spent, currency)} trend={trend.map((point) => point.spent)}>
              <SpendDelta percent={kpis.spentChangePct} partial={forecast.isCurrentMonth} />
            </StatTile>
            <StatTile
              label={forecast.isCurrentMonth ? 'Projected savings' : 'Saved'}
              value={formatMoney(projectedSavings, currency)}
            >
              <SavingsStatus projected={projectedSavings} goal={kpis.savingsGoal} currency={currency} />
            </StatTile>
            <StatTile label="Next month forecast" value={formatMoney(forecast.nextMonth, currency)}>
              Weighted average of recent months
            </StatTile>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Cash flow"
              subtitle={forecast.isCurrentMonth ? 'Last 12 months, including this month so far' : 'Last 12 months'}
              action={
                <dl className="hidden gap-5 text-right sm:flex">
                  {[
                    ['Income', yearIncome],
                    ['Spent', yearSpent],
                    ['Saved', yearIncome - yearSpent],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-ink-3 text-xs">{label}</dt>
                      <dd className="text-sm font-semibold">{formatMoneyCompact(value, currency)}</dd>
                    </div>
                  ))}
                </dl>
              }
            />
            <div className="p-5">
              <CashFlowChart trend={trend} currency={currency} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Where the money went" subtitle={formatMonth(data.month)} action={<ViewAll to="/app/expenses" />} />
            <div className="p-5">
              <CategoryBreakdown categories={categories} currency={currency} />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader title="Watch list" subtitle="Categories closest to their limit" />
            <div className="p-5">
              {watchList.length === 0 ? (
                <p className="text-ink-2 py-8 text-center text-sm">Nothing to watch yet.</p>
              ) : (
                <ul className="space-y-4">
                  {watchList.map((item) => (
                    <li key={item.category}>
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                        <span className="truncate font-medium">{item.category}</span>
                        <BudgetStatusLabel percent={item.percentUsed} />
                      </div>
                      <Meter percent={item.percentUsed} label={`${item.category} budget used`} />
                      <p className="text-ink-3 tabular mt-1.5 text-xs">
                        {formatMoney(item.spent, currency)} of {formatMoney(item.planned, currency)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent transactions" action={<ViewAll to="/app/transactions" />} />
            <div className="p-5">
              {transactions.length === 0 ? (
                <p className="text-ink-2 py-8 text-center text-sm">No transactions yet.</p>
              ) : (
                <ul className="divide-line divide-y">
                  {transactions.map((item) => (
                    <TransactionRow key={item.id} item={item} currency={currency} />
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Upcoming reminders" action={<ViewAll to="/app/reminders" />} />
            <div className="p-5">
              {reminders.length === 0 ? (
                <EmptyState icon={LuBell} title="You're all caught up" />
              ) : (
                <ul className="space-y-3.5">
                  {reminders.map((item) => (
                    <ReminderRow key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
