import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
  LuDownload,
  LuPencil,
  LuPlus,
  LuReceipt,
  LuSearch,
  LuTrash2,
  LuX,
} from 'react-icons/lu';
import {
  createExpense,
  deleteExpense,
  fetchBudgets,
  fetchExpenseSummary,
  fetchExpenses,
  updateExpense,
} from '../../api/financeApi';
import { downloadFile, getErrorMessage } from '../../api/client';
import {
  closeCategory,
  openCategory,
  setCategoryExpenses,
  setError,
  setLoading,
  setSummary,
} from '../../redux/features/expenseSlice';
import { setBudgets } from '../../redux/features/budgetSlice';
import { logger } from '../../lib/logger';
import { useWorkspace } from '../../hooks/useWorkspace';
import { currentMonth, formatDate, formatDay, formatMoney, formatMonth, shiftMonth, today } from '../../lib/format';
import { Card, PageHeader } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { CategorySelect } from '../../components/ui/CategorySelect';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import { BudgetStatusLabel, Meter } from '../../components/ui/Meter';

const EMPTY = { categoryName: '', amount: '', description: '', spentOn: today() };
const UNASSIGNED = 'none';
const CATEGORIES_PER_PAGE = 10;
const EXPENSES_PER_PAGE = 8;

/** Opens the form straight away when another page links here with ?new=1 (and optionally a budget). */
function formFromLink(searchParams) {
  if (searchParams.get('new') !== '1') return null;
  const month = searchParams.get('month');
  const spentOn = month && month !== currentMonth() ? `${month}-01` : today();
  return { ...EMPTY, spentOn, budgetId: searchParams.get('budget') ?? undefined };
}

function Kpi({ label, value, detail }) {
  return (
    <div className="px-5 py-4">
      <p className="text-ink-2 text-[13px]">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
      {detail && <p className="text-ink-3 mt-0.5 truncate text-xs">{detail}</p>}
    </div>
  );
}

function Pager({ page, total, perPage, noun, onChange }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  const first = (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);
  return (
    <div className="border-line flex items-center justify-between gap-3 border-t px-5 py-3 text-sm">
      <span className="text-ink-3 tabular">
        {first}–{last} of {total} {noun}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <LuChevronLeft className="size-3.5" aria-hidden="true" /> Previous
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next <LuChevronRight className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

/** One thin bar per day of the month. Clicking a day shows only that day. */
function DayStrip({ month, daily, selectedDay, onSelect, currency }) {
  const [year, monthNumber] = month.split('-').map(Number);
  const totals = new Map(daily.map((entry) => [entry.date, entry]));
  const days = Array.from({ length: new Date(year, monthNumber, 0).getDate() }, (_, index) => {
    const date = `${month}-${String(index + 1).padStart(2, '0')}`;
    return { date, day: index + 1, total: totals.get(date)?.total ?? 0, count: totals.get(date)?.count ?? 0 };
  });
  const largest = Math.max(1, ...days.map((item) => item.total));
  const todayDate = today();

  return (
    <div className="flex items-end gap-px px-5 pt-1 pb-4 sm:gap-1" role="group" aria-label={`Days of ${formatMonth(month)}`}>
      {days.map((item) => {
        const selected = selectedDay === item.date;
        const label = item.count
          ? `${formatDay(item.date)}: ${formatMoney(item.total, currency)} across ${item.count} ${item.count === 1 ? 'expense' : 'expenses'}`
          : `${formatDay(item.date)}: no expenses`;
        return (
          <button
            key={item.date}
            type="button"
            disabled={item.count === 0}
            aria-pressed={selected}
            aria-label={label}
            title={label}
            onClick={() => onSelect(selected ? '' : item.date)}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md pt-1 pb-0.5 transition-colors disabled:cursor-default ${
              selected ? 'ring-accent-text ring-1 ring-inset' : 'enabled:hover:bg-surface-2'
            }`}
          >
            <span className="flex h-16 w-full max-w-3 items-end">
              <span
                className={`w-full rounded-t-sm ${item.count ? 'bg-accent' : 'bg-surface-2'}`}
                style={{ height: item.count ? `${Math.max((item.total / largest) * 100, 4)}%` : '2px' }}
              />
            </span>
            <span
              className={`h-3.5 text-[10px] leading-none ${item.date === todayDate ? 'text-ink font-semibold' : 'text-ink-3'} ${
                item.day === 1 || item.day % 5 === 0 || selected ? '' : 'invisible'
              }`}
            >
              {item.day}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ExpenseLine({ expense, currency, onEdit, onDelete }) {
  return (
    <li className="flex items-center gap-3 py-2.5 pr-5 pl-[4.25rem]">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{expense.description || <span className="text-ink-3">No description</span>}</p>
        <p className="text-ink-3 mt-0.5 flex items-center gap-1.5 text-xs">
          {formatDate(expense.spentOn)}
          {expense.budgetName ? (
            <Link to={`/app/budgets/${expense.budgetId}`} className="bg-accent-soft text-accent-text rounded px-1.5 py-px font-medium">
              {expense.budgetName}
            </Link>
          ) : (
            <span>· No budget</span>
          )}
        </p>
      </div>
      <span className="tabular shrink-0 text-sm font-medium">{formatMoney(expense.amount, currency)}</span>
      <div className="flex shrink-0">
        <IconButton label={`Edit ${expense.description || expense.categoryName} expense`} onClick={() => onEdit(expense)}>
          <LuPencil className="size-4" />
        </IconButton>
        <IconButton label={`Delete ${expense.description || expense.categoryName} expense`} onClick={() => onDelete(expense)}>
          <LuTrash2 className="size-4" />
        </IconButton>
      </div>
    </li>
  );
}

/** A category appears once, however many times it was used; its expenses open beneath it. */
function CategoryRow({ category, open, currency, onToggle, onPage, onEdit, onDelete }) {
  const expanded = open?.categoryName === category.categoryName;
  const percent = category.planned > 0 ? (category.total / category.planned) * 100 : 0;
  const panelId = `category-${category.categoryName.replace(/\W+/g, '-')}`;

  return (
    <li>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => onToggle(category.categoryName)}
        className="hover:bg-surface-2/50 flex w-full items-center gap-3 px-5 py-3.5 text-left"
      >
        <span className="bg-surface-2 text-ink-2 flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
          {category.categoryName.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate font-medium">{category.categoryName}</p>
            <p className="tabular shrink-0 font-semibold">{formatMoney(category.total, currency)}</p>
          </div>
          <div className="text-ink-3 mt-0.5 flex items-center justify-between gap-3 text-xs">
            <span className="truncate">
              {category.count} {category.count === 1 ? 'expense' : 'expenses'} · last {formatDate(category.lastSpentOn)}
            </span>
            {category.planned > 0 ? (
              <span className="tabular shrink-0">of {formatMoney(category.planned, currency)} limit</span>
            ) : (
              <span className="shrink-0">No limit set</span>
            )}
          </div>
          {category.planned > 0 && (
            <div className="mt-2 flex items-center gap-3">
              <Meter percent={percent} label={`${category.categoryName} limit used`} />
              <span className="shrink-0">
                <BudgetStatusLabel percent={percent} />
              </span>
            </div>
          )}
        </div>
        <LuChevronDown
          className={`text-ink-3 size-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div id={panelId} className="bg-surface-2/40 border-line border-t">
          {open.loading && open.items.length === 0 ? (
            <div className="space-y-2 py-3 pr-5 pl-[4.25rem]">
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
            </div>
          ) : (
            <ul className="divide-line divide-y">
              {open.items.map((expense) => (
                <ExpenseLine key={expense.id} expense={expense} currency={currency} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </ul>
          )}
          <Pager page={open.page} total={open.total} perPage={EXPENSES_PER_PAGE} noun="expenses" onChange={onPage} />
        </div>
      )}
    </li>
  );
}

function Expenses() {
  const dispatch = useDispatch();
  const { summary, open, loading, error } = useSelector((state) => state.expense);
  const budgets = useSelector((state) => state.budget.items);
  const { activeId, currency } = useWorkspace();
  const [month, setMonth] = useState(currentMonth());
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [day, setDay] = useState('');
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState(() => formFromLink(searchParams));
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const filters = { month, budget: budgetFilter || undefined, search: search || undefined, day: day || undefined };

  // Waits for a pause in typing so each keystroke doesn't trigger a request.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadSummary = useCallback(async () => {
    try {
      dispatch(setLoading());
      dispatch(setSummary(await fetchExpenseSummary({ ...filters, page, limit: CATEGORIES_PER_PAGE })));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, month, budgetFilter, search, day, page, activeId]);

  const loadCategory = useCallback(
    async (categoryName, categoryPage = 1) => {
      try {
        const result = await fetchExpenses({ ...filters, category: categoryName, page: categoryPage, limit: EXPENSES_PER_PAGE });
        dispatch(setCategoryExpenses({ categoryName, ...result }));
      } catch (err) {
        toast.error(getErrorMessage(err));
        dispatch(closeCategory());
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, month, budgetFilter, search, day, activeId],
  );

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // A change of filters or page collapses the open category, since its list no longer matches.
  useEffect(() => {
    dispatch(closeCategory());
  }, [dispatch, month, budgetFilter, search, day, page, activeId]);

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        dispatch(setBudgets(await fetchBudgets()));
      } catch (err) {
        // The budget picker is optional, so the page still works without it.
        logger.warn('Could not load budgets', getErrorMessage(err));
      }
    };
    loadBudgets();
  }, [dispatch, activeId]);

  const budgetsFor = (date) => budgets.filter((budget) => budget.month === date.slice(0, 7));
  // Until someone picks, a month with exactly one budget uses it, matching what the API does.
  const selectedBudget = (draft) => {
    if (draft.budgetId !== undefined) return draft.budgetId;
    const options = budgetsFor(draft.spentOn);
    return options.length === 1 ? String(options[0].id) : '';
  };
  const changeDate = (spentOn) => {
    const stillValid = budgetsFor(spentOn).some((budget) => String(budget.id) === form.budgetId);
    setForm({ ...form, spentOn, budgetId: stillValid ? form.budgetId : undefined });
  };

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  const changeMonth = (next) => {
    if (!next) return;
    setMonth(next);
    setDay('');
    setBudgetFilter('');
    setPage(1);
  };

  const toggleCategory = (categoryName) => {
    if (open?.categoryName === categoryName) {
      dispatch(closeCategory());
      return;
    }
    dispatch(openCategory(categoryName));
    loadCategory(categoryName);
  };

  const refresh = () => {
    loadSummary();
    if (open) loadCategory(open.categoryName, open.page);
  };

  const closeForm = () => {
    setForm(null);
    if (searchParams.has('new')) setSearchParams({}, { replace: true });
  };

  // "Save and add another" keeps the date and budget, so several receipts go in quickly.
  const submit = async (event) => {
    event.preventDefault();
    const again = event.nativeEvent.submitter?.value === 'again';
    const payload = {
      categoryName: form.categoryName.trim(),
      amount: Number(form.amount),
      description: form.description,
      spentOn: form.spentOn,
      budgetId: selectedBudget(form) ? Number(selectedBudget(form)) : null,
    };
    try {
      setSaving(true);
      if (form.id) await updateExpense(form.id, payload);
      else await createExpense(payload);
      toast.success(form.id ? 'Expense updated.' : 'Expense added.');
      if (again) setForm({ ...EMPTY, spentOn: form.spentOn, budgetId: form.budgetId, categoryName: form.categoryName });
      else closeForm();
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteExpense(pendingDelete.id);
      toast.success('Expense deleted.');
      refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPendingDelete(null);
  };

  const exportExcel = () =>
    downloadFile(`/integrations/export/expenses.xlsx?month=${month}`, `expenses-${month}.xlsx`).catch((err) =>
      toast.error(getErrorMessage(err)),
    );

  const newExpense = () => setForm({ ...EMPTY, spentOn: month === currentMonth() ? today() : `${month}-01` });
  const editExpense = (expense) => setForm({ ...expense, budgetId: expense.budgetId ? String(expense.budgetId) : '' });

  const isThisMonth = month === currentMonth();
  const daysCounted = isThisMonth ? new Date().getDate() : new Date(...month.split('-').map(Number), 0).getDate();
  const filtered = Boolean(day || budgetFilter || search);
  const monthBudgets = budgetsFor(`${month}-01`);
  const totals = summary?.totals;
  const categories = summary?.categories;

  let list;
  if (error && !summary) {
    list = <ErrorState message={error} onRetry={loadSummary} />;
  } else if (!summary) {
    list = (
      <div className="space-y-3 p-5">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    );
  } else if (totals.monthSpent === 0 && !filtered) {
    list = (
      <EmptyState
        icon={LuReceipt}
        title={`No expenses in ${formatMonth(month)}`}
        description="Log what you spend and it's counted against your budget's limits straight away."
        action={
          <Button onClick={newExpense}>
            <LuPlus className="size-4" aria-hidden="true" /> Add expense
          </Button>
        }
      />
    );
  } else if (categories.items.length === 0) {
    list = <EmptyState icon={LuSearch} title="No matching expenses" description="Try a different search, budget or day." />;
  } else {
    list = (
      <>
        <ul className="divide-line divide-y">
          {categories.items.map((category) => (
            <CategoryRow
              key={category.categoryName}
              category={category}
              open={open}
              currency={currency}
              onToggle={toggleCategory}
              onPage={(nextPage) => loadCategory(category.categoryName, nextPage)}
              onEdit={editExpense}
              onDelete={setPendingDelete}
            />
          ))}
        </ul>
        <Pager page={categories.page} total={categories.total} perPage={CATEGORIES_PER_PAGE} noun="categories" onChange={setPage} />
      </>
    );
  }

  return (
    <>
      <title>Expenses — Budget Book</title>
      <PageHeader title="Expenses" subtitle="What you've spent, by category. Open one to see each expense.">
        <Button variant="secondary" onClick={exportExcel}>
          <LuDownload className="size-4" aria-hidden="true" /> Export
        </Button>
        <Button onClick={newExpense}>
          <LuPlus className="size-4" aria-hidden="true" /> Add expense
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="border-line bg-surface flex h-10 items-center rounded-lg border">
          <IconButton label="Previous month" className="ml-0.5" onClick={() => changeMonth(shiftMonth(month, -1))}>
            <LuChevronLeft className="size-4" />
          </IconButton>
          <input
            type="month"
            aria-label="Month"
            value={month}
            onChange={(event) => changeMonth(event.target.value)}
            className="h-full w-36 bg-transparent px-1 text-center text-sm font-medium outline-none"
          />
          <IconButton label="Next month" className="mr-0.5" onClick={() => changeMonth(shiftMonth(month, 1))}>
            <LuChevronRight className="size-4" />
          </IconButton>
        </div>
        <div className="relative min-w-56 flex-1 sm:max-w-xs">
          <LuSearch className="text-ink-3 absolute top-3 left-3 size-4" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search expenses"
            placeholder="Search description or category"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="border-line bg-surface h-10 w-full rounded-lg border pr-3 pl-9 text-sm"
          />
        </div>
        <select
          aria-label="Filter by budget"
          value={budgetFilter}
          onChange={(event) => changeFilter(setBudgetFilter)(event.target.value)}
          className="border-line bg-surface h-10 rounded-lg border px-3 text-sm"
        >
          <option value="">All budgets</option>
          {monthBudgets.map((budget) => (
            <option key={budget.id} value={budget.id}>
              {budget.name}
            </option>
          ))}
          <option value={UNASSIGNED}>No budget</option>
        </select>
        {day && (
          <button
            type="button"
            onClick={() => changeFilter(setDay)('')}
            className="bg-accent-soft text-accent-text inline-flex h-8 items-center gap-1.5 rounded-full pr-2 pl-3 text-[13px] font-medium"
          >
            {formatDay(day)}
            <LuX className="size-3.5" aria-label="Show every day" />
          </button>
        )}
      </div>

      <div className={`space-y-4 transition-opacity ${loading && summary ? 'opacity-60' : ''}`}>
        {totals && (
          <Card>
            <div className="divide-line grid grid-cols-2 divide-x md:grid-cols-4">
              <Kpi
                label={filtered ? 'Shown' : `Spent in ${formatMonth(month, 'short')}`}
                value={formatMoney(filtered ? totals.spent : totals.monthSpent, currency)}
                detail={filtered ? `of ${formatMoney(totals.monthSpent, currency)} this month` : undefined}
              />
              <Kpi
                label="Expenses"
                value={totals.count}
                detail={`in ${categories.total} ${categories.total === 1 ? 'category' : 'categories'}`}
              />
              <Kpi
                label="Daily average"
                value={formatMoney(daysCounted > 0 ? totals.monthSpent / daysCounted : 0, currency)}
                detail={isThisMonth ? `Over ${daysCounted} days so far` : `Over ${daysCounted} days`}
              />
              <Kpi
                label="Largest expense"
                value={formatMoney(totals.largest?.amount ?? 0, currency)}
                detail={totals.largest ? totals.largest.description || totals.largest.categoryName : 'None yet'}
              />
            </div>
            {summary.daily.length > 0 && (
              <div className="border-line border-t">
                <div className="flex items-center justify-between gap-3 px-5 pt-3">
                  <p className="text-ink-2 text-[13px] font-medium">Daily spending</p>
                  <p className="text-ink-3 hidden text-xs sm:block">Click a day to filter</p>
                </div>
                <DayStrip
                  month={month}
                  daily={summary.daily}
                  selectedDay={day}
                  onSelect={changeFilter(setDay)}
                  currency={currency}
                />
              </div>
            )}
          </Card>
        )}

        <Card>{list}</Card>
      </div>

      <Modal
        open={Boolean(form)}
        size="lg"
        title={form?.id ? 'Edit expense' : 'Add expense'}
        description={form?.id ? undefined : "It counts against the category's limit in the budget you choose."}
        onClose={closeForm}
      >
        {form && (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
              />
              <Input
                label="Date"
                type="date"
                required
                value={form.spentOn}
                onChange={(event) => event.target.value && changeDate(event.target.value)}
              />
              <CategorySelect value={form.categoryName} onChange={(categoryName) => setForm({ ...form, categoryName })} />
              <Select
                label="Budget"
                value={selectedBudget(form)}
                onChange={(event) => setForm({ ...form, budgetId: event.target.value })}
                hint={budgetsFor(form.spentOn).length === 0 ? 'There is no budget for this month yet.' : undefined}
              >
                {budgetsFor(form.spentOn).map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name}
                  </option>
                ))}
                <option value="">No budget</option>
              </Select>
            </div>
            <Textarea
              label="Description (optional)"
              rows={2}
              maxLength={255}
              placeholder="e.g. Weekly shop"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <div className="border-line flex flex-wrap justify-end gap-2 border-t pt-4">
              <Button variant="secondary" onClick={closeForm}>
                Cancel
              </Button>
              {!form.id && (
                <Button type="submit" variant="secondary" name="intent" value="again" disabled={saving}>
                  Save and add another
                </Button>
              )}
              <Button type="submit" loading={saving}>
                Save
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this expense?"
        message={`${pendingDelete?.description || pendingDelete?.categoryName} (${formatMoney(pendingDelete?.amount, currency)}) will be removed.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default Expenses;
