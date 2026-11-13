import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuArrowLeftRight,
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
import { BudgetStatusLabel } from '../../components/ui/Meter';
import { Pagination } from '../../components/ui/Pagination';

const EMPTY = { categoryName: '', amount: '', description: '', spentOn: today() };
const UNASSIGNED = 'none';
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

/** Percentage plus an icon and word, so the state never depends on colour or a bar. */
function LimitUsed({ category }) {
  if (category.planned <= 0) return <span className="text-ink-3 text-xs">No limit</span>;
  const percent = (category.total / category.planned) * 100;
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="tabular w-10 text-right text-[13px] font-medium">{Math.round(percent)}%</span>
      <BudgetStatusLabel percent={percent} />
    </span>
  );
}

/**
 * The expenses of one category, shown in a row spanning the whole table. Its
 * fixed layout gives the description whatever width the other columns leave.
 */
function CategoryExpenses({ open, panelId, currency, onPage, onEdit, onDelete }) {
  return (
    <tr id={panelId}>
      <td colSpan={7} className="bg-surface-2/40 p-0">
        {open.loading && open.items.length === 0 ? (
          <div className="space-y-2 px-5 py-3">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        ) : (
          <table className="w-full table-fixed text-sm">
            <caption className="sr-only">{open.categoryName} expenses</caption>
            <tbody className="divide-line divide-y">
              {open.items.map((expense) => (
                <tr key={expense.id}>
                  <td className="text-ink-2 w-44 py-2.5 pr-3 pl-14 whitespace-nowrap">{formatDate(expense.spentOn)}</td>
                  <td className="py-2.5 pr-3">
                    <p className="truncate">{expense.description || <span className="text-ink-3">No description</span>}</p>
                  </td>
                  <td className="hidden w-44 truncate py-2.5 pr-3 whitespace-nowrap sm:table-cell">
                    {expense.budgetName ? (
                      <Link
                        to={`/app/budgets/${expense.budgetId}`}
                        className="bg-accent-soft text-accent-text rounded px-1.5 py-0.5 text-xs font-medium"
                      >
                        {expense.budgetName}
                      </Link>
                    ) : (
                      <span className="text-ink-3 text-xs">No budget</span>
                    )}
                  </td>
                  <td className="tabular w-32 py-2.5 pr-3 text-right font-medium whitespace-nowrap">
                    {formatMoney(expense.amount, currency)}
                  </td>
                  <td className="w-24 py-1.5 pr-4 text-right whitespace-nowrap">
                    {/* Expenses made from a transaction change with it, so they're edited there. */}
                    {expense.transactionId ? (
                      <Link
                        to="/app/transactions"
                        title="This expense comes from a transaction. Edit it there."
                        className="text-accent-text inline-flex items-center gap-1 text-xs font-medium"
                      >
                        <LuArrowLeftRight className="size-3.5" aria-hidden="true" /> Transaction
                      </Link>
                    ) : (
                      <>
                        <IconButton label={`Edit ${expense.description || expense.categoryName} expense`} onClick={() => onEdit(expense)}>
                          <LuPencil className="size-4" />
                        </IconButton>
                        <IconButton label={`Delete ${expense.description || expense.categoryName} expense`} onClick={() => onDelete(expense)}>
                          <LuTrash2 className="size-4" />
                        </IconButton>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination compact page={open.page} total={open.total} perPage={EXPENSES_PER_PAGE} noun="expenses" onPageChange={onPage} />
      </td>
    </tr>
  );
}

/**
 * One row per category, however often it was used. Clicking the row opens its
 * expenses underneath; the name is a real button so keyboards can do the same.
 */
function CategoryTable({ categories, open, currency, onToggle, onPage, onEdit, onDelete }) {
  const head = 'px-5 py-3 font-medium whitespace-nowrap';
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-line text-ink-3 border-b text-xs">
            <th scope="col" className={head}>Category</th>
            <th scope="col" className={`${head} text-right`}>Expenses</th>
            <th scope="col" className={`${head} hidden md:table-cell`}>Last spent</th>
            <th scope="col" className={`${head} text-right`}>Spent</th>
            <th scope="col" className={`${head} hidden text-right sm:table-cell`}>Limit</th>
            <th scope="col" className={head}>Used</th>
            <th scope="col" className="w-12">
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-line divide-y">
          {categories.map((category) => {
            const expanded = open?.categoryName === category.categoryName;
            const panelId = `category-${category.categoryName.replace(/\W+/g, '-')}`;
            return [
              <tr
                key={category.categoryName}
                onClick={() => onToggle(category.categoryName)}
                className={`cursor-pointer transition-colors ${expanded ? 'bg-surface-2/60' : 'hover:bg-surface-2/50'}`}
              >
                <td className="px-5 py-3">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggle(category.categoryName);
                    }}
                    className="flex items-center gap-3 text-left"
                  >
                    <span className="bg-surface-2 text-ink-2 flex size-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-semibold">
                      {category.categoryName.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-medium">{category.categoryName}</span>
                  </button>
                </td>
                <td className="tabular text-ink-2 px-5 py-3 text-right">{category.count}</td>
                <td className="text-ink-2 hidden px-5 py-3 whitespace-nowrap md:table-cell">{formatDate(category.lastSpentOn)}</td>
                <td className="tabular px-5 py-3 text-right font-semibold whitespace-nowrap">{formatMoney(category.total, currency)}</td>
                <td className="tabular text-ink-2 hidden px-5 py-3 text-right whitespace-nowrap sm:table-cell">
                  {category.planned > 0 ? formatMoney(category.planned, currency) : '—'}
                </td>
                <td className="px-5 py-3">
                  <LimitUsed category={category} />
                </td>
                <td className="pr-4 text-right">
                  <LuChevronDown
                    className={`text-ink-3 inline size-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </td>
              </tr>,
              expanded && (
                <CategoryExpenses
                  key={`${category.categoryName}-expenses`}
                  open={open}
                  panelId={panelId}
                  currency={currency}
                  onPage={onPage}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ),
            ];
          })}
        </tbody>
      </table>
    </div>
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
  const [perPage, setPerPage] = useState(10);
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
      dispatch(setSummary(await fetchExpenseSummary({ ...filters, page, limit: perPage })));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, month, budgetFilter, search, day, page, perPage, activeId]);

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
  }, [dispatch, month, budgetFilter, search, day, page, perPage, activeId]);

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
        <CategoryTable
          categories={categories.items}
          open={open}
          currency={currency}
          onToggle={toggleCategory}
          onPage={(nextPage) => loadCategory(open.categoryName, nextPage)}
          onEdit={editExpense}
          onDelete={setPendingDelete}
        />
        <Pagination
          page={categories.page}
          total={categories.total}
          perPage={perPage}
          noun="categories"
          onPageChange={setPage}
          onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
          }}
        />
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
