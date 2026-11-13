import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LuArrowLeft, LuPencil, LuPlus, LuReceipt, LuTrash2, LuTriangleAlert, LuX } from 'react-icons/lu';
import {
  addBudgetItems,
  deleteBudget,
  deleteBudgetItem,
  fetchBudget,
  updateBudget,
  updateBudgetItem,
} from '../../api/financeApi';
import { getErrorMessage } from '../../api/client';
import { clearDetail, setDetail, setError, setLoading } from '../../redux/features/budgetSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useCategories } from '../../hooks/useCategories';
import { formatDate, formatMoney, formatMonth } from '../../lib/format';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button, buttonClass, IconButton } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { CategorySelect } from '../../components/ui/CategorySelect';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import { BudgetStatusLabel, Meter } from '../../components/ui/Meter';
import { CategoryBreakdown } from '../../components/charts/CategoryBreakdown';

/** Starter categories picked from the budget's name, so a new budget is quick to fill. */
const SUGGESTIONS = [
  { match: /car|vehicle|auto/i, names: ['Fuel', 'Repairs', 'Vehicle Payments', 'Auto Insurance'] },
  { match: /trip|travel|vacation|holiday|weekend/i, names: ['Flights', 'Hotels', 'Sightseeing', 'Dining Out'] },
  { match: /home|house|household|rent/i, names: ['Mortgage/Rent', 'Groceries', 'Electricity', 'Internet'] },
  { match: /business|office|studio|work/i, names: ['Office Rent', 'Payroll', 'Software', 'Marketing'] },
  { match: /wedding|event|party/i, names: ['Gifts Given', 'Dining Out', 'Clothing', 'Activities'] },
];
const DEFAULT_SUGGESTIONS = ['Groceries', 'Dining Out', 'Fuel', 'Electricity'];

function suggestionsFor(budgetName) {
  return SUGGESTIONS.find((entry) => entry.match.test(budgetName))?.names ?? DEFAULT_SUGGESTIONS;
}

function AddItemForm({ budget, onAdded, onCancel }) {
  const { categories } = useCategories();
  const amountInput = useRef(null);
  const [categoryName, setCategoryName] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const known = new Set(categories.flatMap((category) => category.subcategories.map((sub) => sub.name)));
  const planned = new Set(budget.items.map((item) => item.categoryName));
  const quickPicks = suggestionsFor(budget.name).filter((name) => known.has(name) && !planned.has(name));

  const pick = (name) => {
    setCategoryName(name);
    amountInput.current?.focus();
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await addBudgetItems(budget.id, [{ categoryName, amount: Number(amount) }]);
      setCategoryName('');
      setAmount('');
      onAdded();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="border-line bg-surface-2/40 border-b px-5 py-4">
      <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto_auto]">
        <CategorySelect value={categoryName} onChange={setCategoryName} />
        <Input
          ref={amountInput}
          label="Monthly limit"
          type="number"
          min="0.01"
          step="0.01"
          required
          placeholder="0.00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <Button type="submit" loading={saving}>
          <LuPlus className="size-4" aria-hidden="true" /> Add
        </Button>
        {onCancel && (
          <IconButton label="Close" className="mb-1" onClick={onCancel}>
            <LuX className="size-4" />
          </IconButton>
        )}
      </div>
      {quickPicks.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-ink-3 mr-1 text-xs">Suggested:</span>
          {quickPicks.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => pick(name)}
              className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                categoryName === name
                  ? 'border-accent-text bg-accent-soft text-accent-text'
                  : 'border-line text-ink-2 bg-surface hover:bg-surface-2'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

function CategoryRow({ item, currency, canManage, onEdit, onRemove }) {
  return (
    <li className="group px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate font-medium">{item.categoryName}</p>
            <p className="tabular shrink-0 text-sm">
              <span className="font-medium">{formatMoney(item.spent, currency)}</span>
              <span className="text-ink-3"> of {formatMoney(item.amount, currency)}</span>
            </p>
          </div>
          <div className="mt-2">
            <Meter percent={item.percentUsed} label={`${item.categoryName} budget used`} />
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3 text-xs">
            <BudgetStatusLabel percent={item.percentUsed} />
            <span className={`tabular ${item.remaining < 0 ? 'text-critical' : 'text-ink-3'}`}>
              {item.remaining < 0
                ? `${formatMoney(-item.remaining, currency)} over`
                : `${formatMoney(item.remaining, currency)} left`}
            </span>
          </div>
        </div>
        {canManage && (
          <div className="flex shrink-0">
            <IconButton label={`Edit ${item.categoryName}`} onClick={() => onEdit(item)}>
              <LuPencil className="size-4" />
            </IconButton>
            <IconButton label={`Remove ${item.categoryName}`} onClick={() => onRemove(item)}>
              <LuTrash2 className="size-4" />
            </IconButton>
          </div>
        )}
      </div>
    </li>
  );
}

/** One whole (the income) split into planned spending, savings and what's still free. */
function Allocation({ budget, currency }) {
  const free = budget.income - budget.planned - budget.savingsGoal;
  const total = Math.max(budget.income, budget.planned + budget.savingsGoal);
  const parts = [
    { label: 'Planned spending', value: budget.planned, color: 'var(--chart-1)' },
    { label: 'Savings goal', value: budget.savingsGoal, color: 'var(--chart-2)' },
    { label: 'Not yet planned', value: Math.max(free, 0), color: 'var(--line)' },
  ];

  return (
    <div className="p-5">
      <div
        className="flex h-2 gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={parts.map((part) => `${part.label} ${formatMoney(part.value, currency)}`).join(', ')}
      >
        {parts
          .filter((part) => part.value > 0)
          .map((part) => (
            <span key={part.label} style={{ width: `${(part.value / total) * 100}%`, background: part.color }} />
          ))}
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        {parts.map((part) => (
          <div key={part.label} className="flex items-center justify-between gap-3">
            <dt className="text-ink-2 flex items-center gap-2">
              <span className="size-2.5 rounded-sm" style={{ background: part.color }} />
              {part.label}
            </dt>
            <dd className="tabular font-medium">{formatMoney(part.value, currency)}</dd>
          </div>
        ))}
      </dl>
      {free < 0 && (
        <p className="text-warning mt-3 flex items-start gap-1.5 text-xs">
          <LuTriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Plans and savings are {formatMoney(-free, currency)} more than the income.
        </p>
      )}
    </div>
  );
}

function BudgetDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { detail: budget, detailLoaded, error } = useSelector((state) => state.budget);
  const { activeId, currency, canManage } = useWorkspace();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [pendingRemove, setPendingRemove] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      dispatch(setDetail(await fetchBudget(id)));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, id, activeId]);

  useEffect(() => {
    load();
    // Clearing on exit stops the previous budget flashing when another is opened.
    return () => dispatch(clearDetail());
  }, [dispatch, load]);

  if (error) {
    return (
      <Card>
        <ErrorState message={error} onRetry={load} />
      </Card>
    );
  }
  if (!detailLoaded || !budget) return <PageLoader />;

  const saveItem = async (event) => {
    event.preventDefault();
    try {
      await updateBudgetItem(budget.id, editing.id, Number(editing.amount));
      toast.success('Category updated.');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const saveBudget = async (event) => {
    event.preventDefault();
    try {
      await updateBudget(budget.id, {
        name: editingBudget.name.trim(),
        income: Number(editingBudget.income || 0),
        savingsGoal: Number(editingBudget.savingsGoal || 0),
      });
      toast.success('Budget updated.');
      setEditingBudget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmRemove = async () => {
    try {
      await deleteBudgetItem(budget.id, pendingRemove.id);
      toast.success('Category removed.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPendingRemove(null);
  };

  const confirmDeleteBudget = async () => {
    try {
      await deleteBudget(budget.id);
      toast.success('Budget deleted.');
      navigate('/app/budgets');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
    }
  };

  const percentUsed = budget.planned > 0 ? (budget.spent / budget.planned) * 100 : 0;
  const remaining = budget.planned - budget.spent;
  const hasItems = budget.items.length > 0;
  const showForm = canManage && (adding || !hasItems);
  const spending = [
    ...budget.items.map((item) => ({ category: item.categoryName, spent: item.spent })),
    ...budget.unplanned.map((item) => ({ category: item.categoryName, spent: item.spent })),
  ].sort((a, b) => b.spent - a.spent);
  const addExpenseLink = `/app/expenses?new=1&budget=${budget.id}&month=${budget.month}`;

  return (
    <>
      <title>{`${budget.name}, ${formatMonth(budget.month)} — Budget Book`}</title>

      <Link to="/app/budgets" className="text-ink-2 hover:text-ink mb-3 inline-flex items-center gap-1 text-sm">
        <LuArrowLeft className="size-4" aria-hidden="true" /> Budgets
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-accent-soft text-accent-text flex size-12 items-center justify-center rounded-xl text-lg font-semibold">
            {budget.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{budget.name}</h1>
              {budget.planned > 0 && <BudgetStatusLabel percent={percentUsed} />}
            </div>
            <p className="text-ink-2 text-sm">
              {formatMonth(budget.month)} · {budget.items.length}{' '}
              {budget.items.length === 1 ? 'category' : 'categories'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage && (
            <>
              <IconButton label="Delete budget" className="size-10! border-line border" onClick={() => setDeleting(true)}>
                <LuTrash2 className="size-4" />
              </IconButton>
              <Button
                variant="secondary"
                onClick={() => setEditingBudget({ name: budget.name, income: budget.income, savingsGoal: budget.savingsGoal })}
              >
                <LuPencil className="size-4" aria-hidden="true" /> Edit
              </Button>
            </>
          )}
          <Link to={addExpenseLink} className={buttonClass('primary')}>
            <LuPlus className="size-4" aria-hidden="true" /> Add expense
          </Link>
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card className="p-6">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <div>
                <p className="text-ink-2 text-sm">{remaining < 0 ? 'Over plan by' : 'Left to spend'}</p>
                <p className={`mt-1 text-4xl font-semibold tracking-tight ${remaining < 0 ? 'text-critical' : ''}`}>
                  {formatMoney(Math.abs(remaining), currency)}
                </p>
                <p className="text-ink-3 mt-1 text-sm">
                  {formatMoney(budget.spent, currency)} spent of {formatMoney(budget.planned, currency)} planned
                </p>
              </div>
              <dl className="divide-line flex divide-x text-sm">
                {[
                  ['Income', budget.income],
                  // Money in from received transactions linked to this budget.
                  ['Received', budget.incomeReceived],
                  ['Savings goal', budget.savingsGoal],
                ].map(([label, value]) => (
                  <div key={label} className="px-5 first:pl-0 last:pr-0">
                    <dt className="text-ink-3 text-xs">{label}</dt>
                    <dd className="mt-0.5 font-semibold">{formatMoney(value, currency)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-5">
              <Meter percent={percentUsed} label="Budget used" />
              <p className="text-ink-3 mt-2 text-xs">
                {budget.planned > 0 ? `${Math.round(percentUsed)}% of the plan used` : 'Add categories to start tracking this budget.'}
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Categories"
              subtitle="Set a limit for each category this month. Every expense in that category counts against it."
              action={
                canManage &&
                hasItems &&
                !adding && (
                  <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
                    <LuPlus className="size-3.5" aria-hidden="true" /> Add category
                  </Button>
                )
              }
            />
            <div className="mt-4 border-line border-t">
              {showForm && (
                <AddItemForm
                  budget={budget}
                  onAdded={() => {
                    setAdding(false);
                    load();
                  }}
                  onCancel={hasItems ? () => setAdding(false) : undefined}
                />
              )}
              {hasItems ? (
                <ul className="divide-line divide-y">
                  {budget.items.map((item) => (
                    <CategoryRow
                      key={item.id}
                      item={item}
                      currency={currency}
                      canManage={canManage}
                      onEdit={(row) => setEditing({ ...row })}
                      onRemove={setPendingRemove}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-ink-2 px-5 py-6 text-center text-sm">
                  {canManage
                    ? 'No limits yet. Pick a category above (or choose Other to type your own) and set how much you can spend on it this month.'
                    : 'No category limits have been set for this budget yet.'}
                </p>
              )}
            </div>
          </Card>

          {budget.unplanned.length > 0 && (
            <Card>
              <CardHeader title="Spending outside the plan" subtitle="Expenses in this budget whose category isn't planned above" />
              <ul className="divide-line mt-3 divide-y">
                {budget.unplanned.map((item) => (
                  <li key={item.categoryName} className="flex justify-between px-5 py-3 text-sm">
                    <span>{item.categoryName}</span>
                    <span className="tabular font-medium">{formatMoney(item.spent, currency)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Where the money went" />
            <div className="p-5">
              <CategoryBreakdown categories={spending} currency={currency} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Income split" subtitle="How this budget's income is allocated" />
            {budget.income > 0 ? (
              <Allocation budget={budget} currency={currency} />
            ) : (
              <p className="text-ink-2 p-5 text-sm">
                No income set for this budget.
                {canManage && (
                  <>
                    {' '}
                    <button
                      type="button"
                      className="text-accent-text font-medium"
                      onClick={() => setEditingBudget({ name: budget.name, income: '', savingsGoal: budget.savingsGoal })}
                    >
                      Add income
                    </button>{' '}
                    to see how it's split.
                  </>
                )}
              </p>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Recent expenses"
              action={
                budget.recentExpenses.length > 0 && (
                  <Link to="/app/expenses" className="text-accent-text text-[13px] font-medium">
                    View all
                  </Link>
                )
              }
            />
            {budget.recentExpenses.length === 0 ? (
              <EmptyState
                icon={LuReceipt}
                title="No expenses yet"
                action={
                  <Link to={addExpenseLink} className={buttonClass('secondary', 'sm')}>
                    <LuPlus className="size-3.5" aria-hidden="true" /> Add expense
                  </Link>
                }
              />
            ) : (
              <ul className="divide-line mt-3 divide-y">
                {budget.recentExpenses.map((expense) => (
                  <li key={expense.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{expense.description || expense.categoryName}</p>
                      <p className="text-ink-3 truncate text-xs">
                        {expense.categoryName} · {formatDate(expense.spentOn)}
                      </p>
                    </div>
                    <span className="tabular shrink-0 text-sm font-medium">{formatMoney(expense.amount, currency)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <Modal open={Boolean(editing)} title={`Edit ${editing?.categoryName ?? ''}`} onClose={() => setEditing(null)}>
        <form onSubmit={saveItem} className="space-y-4">
          <Input
            label="Monthly limit"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={editing?.amount ?? ''}
            onChange={(event) => setEditing({ ...editing, amount: event.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(editingBudget)} title="Edit budget" onClose={() => setEditingBudget(null)}>
        {editingBudget && (
          <form onSubmit={saveBudget} className="space-y-4">
            <Input
              label="Budget name"
              required
              maxLength={80}
              value={editingBudget.name}
              onChange={(event) => setEditingBudget({ ...editingBudget, name: event.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Income or funds"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={editingBudget.income}
                onChange={(event) => setEditingBudget({ ...editingBudget, income: event.target.value })}
              />
              <Input
                label="Savings goal"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={editingBudget.savingsGoal}
                onChange={(event) => setEditingBudget({ ...editingBudget, savingsGoal: event.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditingBudget(null)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingRemove)}
        title="Remove this category?"
        message={`${pendingRemove?.categoryName} will be removed from this budget. Expenses already logged are kept.`}
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
      />

      <ConfirmDialog
        open={deleting}
        title={`Delete "${budget.name}"?`}
        message="The budget and its planned categories will be removed. Its expenses are kept, but no longer belong to a budget."
        onConfirm={confirmDeleteBudget}
        onCancel={() => setDeleting(false)}
      />
    </>
  );
}

export default BudgetDetail;
