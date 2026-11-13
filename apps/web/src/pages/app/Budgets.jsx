import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LuEye, LuPlus, LuSearch, LuTrash2, LuWallet, LuX } from 'react-icons/lu';
import { createBudget, deleteBudget, fetchBudgetYears, fetchBudgets } from '../../api/financeApi';
import { getErrorMessage } from '../../api/client';
import { removeBudget, setBudgets, setError, setLoading, setYears } from '../../redux/features/budgetSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import { currentMonth, formatMoney, formatMonth } from '../../lib/format';
import { Card, PageHeader } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import { BudgetStatusLabel, Meter } from '../../components/ui/Meter';

const NAME_SUGGESTIONS = ['Household', 'Groceries', 'Vacation', 'Business', 'Wedding', 'Car'];
const THIS_YEAR = Number(currentMonth().slice(0, 4));

const sum = (list, key) => list.reduce((total, item) => total + item[key], 0);

function NewBudgetForm({ budgets, onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', month: currentMonth(), income: '', savingsGoal: '', copyFromId: '' });
  const [saving, setSaving] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const budget = await createBudget({
        name: form.name.trim(),
        month: form.month,
        income: Number(form.income || 0),
        savingsGoal: Number(form.savingsGoal || 0),
        ...(form.copyFromId && { copyFromId: Number(form.copyFromId) }),
      });
      toast.success(form.copyFromId ? 'Budget created with its categories.' : 'Budget created. Now plan your categories.');
      navigate(`/app/budgets/${budget.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <Input
          label="Budget name"
          name="name"
          required
          maxLength={80}
          autoFocus
          placeholder="e.g. Household"
          value={form.name}
          onChange={update}
        />
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Name suggestions">
          {NAME_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setForm({ ...form, name: suggestion })}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                form.name === suggestion
                  ? 'border-accent-text bg-accent-soft text-accent-text'
                  : 'border-line text-ink-2 hover:bg-surface-2'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Month" name="month" type="month" required value={form.month} onChange={update} />
        <Input
          label="Income or funds (optional)"
          name="income"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={form.income}
          onChange={update}
        />
        <Input
          label="Savings goal (optional)"
          name="savingsGoal"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={form.savingsGoal}
          onChange={update}
        />
        <Select label="Start from" name="copyFromId" value={form.copyFromId} onChange={update} hint="Copies the categories and amounts.">
          <option value="">Empty budget</option>
          {budgets.map((budget) => (
            <option key={budget.id} value={budget.id}>
              {budget.name} · {formatMonth(budget.month, 'short')}
            </option>
          ))}
        </Select>
      </div>

      <div className="border-line flex justify-end gap-2 border-t pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Create budget
        </Button>
      </div>
    </form>
  );
}

function Kpi({ label, value, tone = '' }) {
  return (
    <div className="px-5 py-4">
      <p className="text-ink-2 text-[13px]">{label}</p>
      <p className={`mt-1 text-xl font-semibold tracking-tight ${tone}`}>{value}</p>
    </div>
  );
}

/**
 * Twelve small columns, one per month: the light track is what was planned,
 * the solid bar is what was spent. Clicking a month filters the table to it.
 */
function YearStrip({ year, budgets, selectedMonth, onSelect, currency }) {
  const months = Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, '0')}`;
    const inMonth = budgets.filter((budget) => budget.month === month);
    return { month, planned: sum(inMonth, 'planned'), spent: sum(inMonth, 'spent'), count: inMonth.length };
  });
  const largest = Math.max(1, ...months.map((item) => Math.max(item.planned, item.spent)));
  const thisMonth = currentMonth();

  return (
    <div className="grid grid-cols-12 gap-1.5 px-5 pt-1 pb-4" role="group" aria-label={`Months of ${year}`}>
      {months.map((item) => {
        const selected = selectedMonth === item.month;
        const over = item.planned > 0 && item.spent > item.planned;
        const label =
          item.count === 0
            ? `${formatMonth(item.month)}: no budgets`
            : `${formatMonth(item.month)}: ${formatMoney(item.spent, currency)} spent of ${formatMoney(item.planned, currency)} planned`;
        let labelTone = 'text-ink-3';
        if (selected) labelTone = 'text-accent-text font-semibold';
        else if (item.month === thisMonth) labelTone = 'text-ink font-semibold';

        return (
          <button
            key={item.month}
            type="button"
            disabled={item.count === 0}
            aria-pressed={selected}
            aria-label={label}
            title={label}
            onClick={() => onSelect(selected ? '' : item.month)}
            className={`flex flex-col items-center gap-1.5 rounded-lg px-1 pt-2 pb-1.5 transition-colors disabled:cursor-default ${
              // An outline, not a fill: the planned bar already uses the light accent colour.
              selected ? 'ring-accent-text ring-1 ring-inset' : 'enabled:hover:bg-surface-2'
            }`}
          >
            <span className="relative flex h-20 w-full max-w-6 items-end justify-center">
              {item.count > 0 && (
                <>
                  <span
                    className="bg-accent-soft absolute bottom-0 w-full rounded-t"
                    style={{ height: `${(item.planned / largest) * 100}%` }}
                  />
                  <span
                    className={`relative w-full rounded-t ${over ? 'bg-critical' : 'bg-accent'}`}
                    style={{ height: `${Math.max((item.spent / largest) * 100, 2)}%` }}
                  />
                </>
              )}
            </span>
            <span className={`text-[11px] ${labelTone}`}>{formatMonth(item.month, 'short').split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

function BudgetRow({ budget, currency, canManage, onDelete }) {
  const percent = budget.planned > 0 ? (budget.spent / budget.planned) * 100 : 0;
  const remaining = budget.planned - budget.spent;
  const cell = 'px-5 py-3';
  const money = `${cell} tabular text-right whitespace-nowrap`;

  return (
    <tr className="hover:bg-surface-2/50">
      <td className={cell}>
        <div className="flex items-center gap-3">
          <span className="bg-accent-soft text-accent-text flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
            {budget.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <Link to={`/app/budgets/${budget.id}`} className="hover:text-accent-text block truncate font-medium">
              {budget.name}
            </Link>
            <p className="text-ink-3 text-xs">
              {budget.itemCount} {budget.itemCount === 1 ? 'category' : 'categories'}
            </p>
          </div>
        </div>
      </td>
      <td className={money}>{formatMoney(budget.planned, currency)}</td>
      <td className={money}>{formatMoney(budget.spent, currency)}</td>
      <td className={`${money} ${remaining < 0 ? 'text-critical' : ''}`}>{formatMoney(remaining, currency)}</td>
      <td className={`${cell} min-w-44`}>
        {budget.planned > 0 ? (
          <div className="flex items-center gap-2">
            <Meter percent={percent} label={`${budget.name} budget used`} />
            <span className="text-ink-3 tabular w-9 shrink-0 text-right text-xs">{Math.round(percent)}%</span>
          </div>
        ) : (
          <span className="text-ink-3 text-xs">Nothing planned yet</span>
        )}
      </td>
      <td className={`${cell} whitespace-nowrap`}>{budget.planned > 0 && <BudgetStatusLabel percent={percent} />}</td>
      <td className={`${cell} text-right whitespace-nowrap`}>
        {/* A link, not a button, so it can also be opened in a new tab. */}
        <Link
          to={`/app/budgets/${budget.id}`}
          aria-label={`View ${budget.name}`}
          title="View budget"
          className="text-ink-2 hover:bg-surface-2 hover:text-ink inline-flex size-8 items-center justify-center rounded-lg transition-colors"
        >
          <LuEye className="size-4" aria-hidden="true" />
        </Link>
        {canManage && (
          <IconButton label={`Delete ${budget.name}`} onClick={() => onDelete(budget)}>
            <LuTrash2 className="size-4" />
          </IconButton>
        )}
      </td>
    </tr>
  );
}

function BudgetTable({ groups, currency, canManage, onDelete }) {
  const head = 'px-5 py-3 font-medium';
  return (
    // relative: keeps the visually hidden header label inside this scroll box, not the page.
    <div className="relative overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-line text-ink-3 border-b text-xs">
            <th scope="col" className={head}>Budget</th>
            <th scope="col" className={`${head} text-right`}>Planned</th>
            <th scope="col" className={`${head} text-right`}>Spent</th>
            <th scope="col" className={`${head} text-right`}>Remaining</th>
            <th scope="col" className={head}>Used</th>
            <th scope="col" className={head}>Status</th>
            <th scope="col" className={head}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        {groups.map((group) => (
          <tbody key={group.month} className="divide-line border-line divide-y border-b last:border-b-0">
            <tr className="bg-surface-2/60">
              <th scope="rowgroup" colSpan={7} className="px-5 py-2 text-left">
                <span className="text-[13px] font-semibold">{formatMonth(group.month)}</span>
                <span className="text-ink-3 ml-2 text-xs font-normal">
                  {group.budgets.length} {group.budgets.length === 1 ? 'budget' : 'budgets'} ·{' '}
                  {formatMoney(sum(group.budgets, 'spent'), currency)} of {formatMoney(sum(group.budgets, 'planned'), currency)}
                </span>
              </th>
            </tr>
            {group.budgets.map((budget) => (
              <BudgetRow key={budget.id} budget={budget} currency={currency} canManage={canManage} onDelete={onDelete} />
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

function Budgets() {
  const dispatch = useDispatch();
  const { items, years, loading, error } = useSelector((state) => state.budget);
  const { activeId, currency, canManage } = useWorkspace();
  const [searchParams, setSearchParams] = useSearchParams();
  // The current year is shown by default; earlier years are one filter away.
  const [year, setYear] = useState(THIS_YEAR);
  const [month, setMonth] = useState('');
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const creating = searchParams.get('new') === '1';

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      const [budgets, budgetYears] = await Promise.all([fetchBudgets({ year }), fetchBudgetYears()]);
      dispatch(setYears(budgetYears));
      dispatch(setBudgets(budgets));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, year, activeId]);

  useEffect(() => {
    load();
  }, [load]);

  const yearOptions = [...new Set([THIS_YEAR, ...years])].sort((a, b) => b - a);
  const term = search.trim().toLowerCase();
  const visible = items.filter((budget) => (!month || budget.month === month) && budget.name.toLowerCase().includes(term));

  // Budgets arrive newest month first, so grouping keeps that order.
  const groups = visible.reduce((result, budget) => {
    const group = result.find((entry) => entry.month === budget.month);
    if (group) group.budgets.push(budget);
    else result.push({ month: budget.month, budgets: [budget] });
    return result;
  }, []);

  const planned = sum(visible, 'planned');
  const spent = sum(visible, 'spent');
  const scope = month ? formatMonth(month) : String(year);

  const confirmDelete = async () => {
    try {
      await deleteBudget(pendingDelete.id);
      dispatch(removeBudget(pendingDelete.id));
      toast.success('Budget deleted.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPendingDelete(null);
  };

  const changeYear = (value) => {
    setYear(Number(value));
    setMonth('');
  };

  const openCreate = () => setSearchParams({ new: '1' });
  const closeCreate = () => setSearchParams({});

  let table;
  if (error) {
    table = <ErrorState message={error} onRetry={load} />;
  } else if (loading && items.length === 0) {
    table = (
      <div className="space-y-3 p-5">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  } else if (items.length === 0) {
    table = (
      <EmptyState
        icon={LuWallet}
        title={`No budgets in ${year}`}
        description="Create one for your household, a trip or a project, or pick another year."
        action={
          canManage && (
            <Button onClick={openCreate}>
              <LuPlus className="size-4" aria-hidden="true" /> New budget
            </Button>
          )
        }
      />
    );
  } else if (visible.length === 0) {
    table = <EmptyState icon={LuSearch} title="No matching budgets" description="Try a different name or month." />;
  } else {
    table = <BudgetTable groups={groups} currency={currency} canManage={canManage} onDelete={setPendingDelete} />;
  }

  return (
    <>
      <title>Budgets — Budget Book</title>
      <PageHeader title="Budgets" subtitle="Plan each month with as many budgets as you need.">
        {canManage && (
          <Button onClick={openCreate}>
            <LuPlus className="size-4" aria-hidden="true" /> New budget
          </Button>
        )}
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          aria-label="Year"
          value={year}
          onChange={(event) => changeYear(event.target.value)}
          className="border-line bg-surface h-10 rounded-lg border px-3 text-sm font-medium"
        >
          {yearOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <LuSearch className="text-ink-3 absolute top-3 left-3 size-4" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search budgets"
            placeholder="Search by name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="border-line bg-surface h-10 w-full rounded-lg border pr-3 pl-9 text-sm"
          />
        </div>
        {month && (
          <button
            type="button"
            onClick={() => setMonth('')}
            className="bg-accent-soft text-accent-text inline-flex h-8 items-center gap-1.5 rounded-full pr-2 pl-3 text-[13px] font-medium"
          >
            {formatMonth(month)}
            <LuX className="size-3.5" aria-label="Show all months" />
          </button>
        )}
      </div>

      <div className={`space-y-4 transition-opacity ${loading ? 'opacity-60' : ''}`}>
        <Card>
          <div className="divide-line grid grid-cols-2 divide-x md:grid-cols-4">
            <Kpi label={`Budgets in ${scope}`} value={visible.length} />
            <Kpi label="Planned" value={formatMoney(planned, currency)} />
            <Kpi label="Spent" value={formatMoney(spent, currency)} />
            <Kpi
              label={planned - spent < 0 ? 'Over plan' : 'Remaining'}
              value={formatMoney(Math.abs(planned - spent), currency)}
              tone={planned - spent < 0 ? 'text-critical' : ''}
            />
          </div>
          {items.length > 0 && (
            <div className="border-line border-t">
              <div className="flex items-center justify-between gap-3 px-5 pt-3">
                <p className="text-ink-2 text-[13px] font-medium">{year} at a glance</p>
                <p className="text-ink-3 flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="bg-accent size-2 rounded-sm" /> Spent
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="bg-accent-soft size-2 rounded-sm" /> Planned
                  </span>
                  <span className="hidden sm:inline">· Click a month to filter</span>
                </p>
              </div>
              <YearStrip year={year} budgets={items} selectedMonth={month} onSelect={setMonth} currency={currency} />
            </div>
          )}
        </Card>

        <Card>{table}</Card>
      </div>

      <Modal
        open={creating}
        size="lg"
        title="New budget"
        description="Give it a name so you can tell it apart, for example Household or Vacation."
        onClose={closeCreate}
      >
        <NewBudgetForm budgets={items} onClose={closeCreate} />
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete "${pendingDelete?.name}"?`}
        message="The budget and its planned categories will be removed. Its expenses are kept, but no longer belong to a budget."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default Budgets;
