import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuArrowDownLeft,
  LuArrowLeftRight,
  LuArrowUpRight,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuClock,
  LuDownload,
  LuInfo,
  LuPencil,
  LuPlus,
  LuSearch,
  LuTrash2,
} from 'react-icons/lu';
import {
  createTransaction,
  deleteTransaction,
  fetchBudgets,
  fetchTransactions,
  updateTransaction,
} from '../../api/financeApi';
import { downloadFile, getErrorMessage } from '../../api/client';
import { setError, setLoading, setTransactions } from '../../redux/features/transactionSlice';
import { setBudgets } from '../../redux/features/budgetSlice';
import { logger } from '../../lib/logger';
import { useWorkspace } from '../../hooks/useWorkspace';
import { currentMonth, formatDate, formatMoney, formatMonth, shiftMonth, today } from '../../lib/format';
import { Card, PageHeader } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { CategorySelect } from '../../components/ui/CategorySelect';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import { Pagination } from '../../components/ui/Pagination';

const TYPES = {
  received: { label: 'Received', icon: LuArrowDownLeft, tone: 'bg-good-soft text-good', sign: '+' },
  sent: { label: 'Sent', icon: LuArrowUpRight, tone: 'bg-surface-2 text-ink-2', sign: '−' },
  pending: { label: 'Pending', icon: LuClock, tone: 'bg-warning-soft text-warning', sign: '' },
};
const TABS = [
  { value: '', label: 'All' },
  { value: 'received', label: 'Received' },
  { value: 'sent', label: 'Sent' },
  { value: 'pending', label: 'Pending' },
];
const UNASSIGNED = 'none';
const EMPTY = {
  type: 'sent',
  date: today(),
  amount: '',
  sender: '',
  receiver: '',
  method: '',
  description: '',
  budgetId: '',
  categoryName: '',
};

function Kpi({ label, value, detail, tone = '' }) {
  return (
    <div className="px-5 py-4">
      <p className="text-ink-2 text-[13px]">{label}</p>
      <p className={`mt-1 text-xl font-semibold tracking-tight ${tone}`}>{value}</p>
      {detail && <p className="text-ink-3 mt-0.5 text-xs">{detail}</p>}
    </div>
  );
}

/** What the budget link will do, in words, so nobody is surprised by the numbers. */
function linkEffect(form, budgetName) {
  if (!form.budgetId) return 'Not linked: this transaction won\'t affect any budget.';
  if (form.type === 'received') return `Counts as income received in "${budgetName}".`;
  if (!form.categoryName) return 'Choose a category so it counts against the right limit.';
  if (form.type === 'pending') return `Will count against "${budgetName}" › ${form.categoryName} once marked as sent.`;
  return `Counts as an expense in "${budgetName}" › ${form.categoryName}.`;
}

function TransactionForm({ form, setForm, budgets, saving, onSubmit, onCancel }) {
  const budgetsInMonth = budgets.filter((budget) => budget.month === form.date.slice(0, 7));
  const selected = budgetsInMonth.find((budget) => String(budget.id) === form.budgetId);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const changeDate = (date) => {
    const stillValid = budgets.some((budget) => String(budget.id) === form.budgetId && budget.month === date.slice(0, 7));
    setForm({ ...form, date, budgetId: stillValid ? form.budgetId : '' });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <fieldset>
        <legend className="text-ink-2 mb-1.5 text-[13px] font-medium">Type</legend>
        <div className="bg-surface-2 grid grid-cols-3 gap-1 rounded-lg p-1">
          {['sent', 'received', 'pending'].map((type) => {
            const Icon = TYPES[type].icon;
            return (
              <label
                key={type}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 text-sm transition-colors ${
                  form.type === type ? 'bg-surface text-ink font-medium shadow-sm' : 'text-ink-2 hover:text-ink'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={form.type === type}
                  onChange={update}
                  className="sr-only"
                />
                <Icon className="size-4" aria-hidden="true" />
                {TYPES[type].label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Amount" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" value={form.amount} onChange={update} />
        <Input label="Date" name="date" type="date" required value={form.date} onChange={(event) => event.target.value && changeDate(event.target.value)} />
        <Input label="From" name="sender" required maxLength={100} value={form.sender} onChange={update} />
        <Input label="To" name="receiver" required maxLength={100} value={form.receiver} onChange={update} />
        <Input label="Payment method" name="method" required maxLength={60} placeholder="Bank, card, cash" value={form.method} onChange={update} />
        <Select
          label="Budget (optional)"
          name="budgetId"
          value={form.budgetId}
          onChange={update}
          hint={budgetsInMonth.length === 0 ? 'There is no budget for this month.' : undefined}
        >
          <option value="">Not linked</option>
          {budgetsInMonth.map((budget) => (
            <option key={budget.id} value={budget.id}>
              {budget.name}
            </option>
          ))}
        </Select>
      </div>

      {form.budgetId && form.type !== 'received' && (
        <CategorySelect value={form.categoryName} onChange={(categoryName) => setForm({ ...form, categoryName })} />
      )}

      <p className="bg-accent-soft/60 text-ink-2 flex items-start gap-2 rounded-lg px-3 py-2 text-[13px]">
        <LuInfo className="text-accent-text mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {linkEffect(form, selected?.name)}
      </p>

      <Textarea label="Note (optional)" name="description" rows={2} maxLength={255} value={form.description} onChange={update} />

      <div className="border-line flex justify-end gap-2 border-t pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Save
        </Button>
      </div>
    </form>
  );
}

function TransactionRow({ item, currency, onEdit, onDelete, onMarkSent }) {
  const type = TYPES[item.type];
  const counterparty = item.type === 'received' ? item.sender : item.receiver;
  return (
    <tr className="hover:bg-surface-2/50">
      <td className="text-ink-2 px-5 py-3 whitespace-nowrap">{formatDate(item.date)}</td>
      <td className="max-w-0 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${type.tone}`}>
            <type.icon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{counterparty}</p>
            <p className="text-ink-3 truncate text-xs">
              {type.label} · {item.method}
              {item.description ? ` · ${item.description}` : ''}
            </p>
          </div>
        </div>
      </td>
      <td className="hidden px-5 py-3 whitespace-nowrap lg:table-cell">
        {item.budgetName ? (
          <Link to={`/app/budgets/${item.budgetId}`} className="group inline-flex flex-col">
            <span className="bg-accent-soft text-accent-text w-fit rounded px-1.5 py-0.5 text-xs font-medium">{item.budgetName}</span>
            <span className="text-ink-3 mt-0.5 text-xs">
              {item.type === 'received' ? 'Income' : item.categoryName}
              {item.type === 'pending' && ' · not counted yet'}
            </span>
          </Link>
        ) : (
          <span className="text-ink-3 text-xs">Not linked</span>
        )}
      </td>
      <td className={`tabular px-5 py-3 text-right font-semibold whitespace-nowrap ${item.type === 'received' ? 'text-good' : ''}`}>
        {type.sign}
        {formatMoney(item.amount, currency)}
      </td>
      <td className="px-4 py-3 text-right whitespace-nowrap">
        {item.type === 'pending' && (
          <IconButton label={`Mark ${counterparty} as sent`} onClick={() => onMarkSent(item)}>
            <LuCheck className="size-4" />
          </IconButton>
        )}
        <IconButton label={`Edit transaction with ${counterparty}`} onClick={() => onEdit(item)}>
          <LuPencil className="size-4" />
        </IconButton>
        <IconButton label={`Delete transaction with ${counterparty}`} onClick={() => onDelete(item)}>
          <LuTrash2 className="size-4" />
        </IconButton>
      </td>
    </tr>
  );
}

const payloadFrom = (form) => ({
  type: form.type,
  date: form.date,
  amount: Number(form.amount),
  sender: form.sender.trim(),
  receiver: form.receiver.trim(),
  method: form.method.trim(),
  description: form.description ?? '',
  budgetId: form.budgetId ? Number(form.budgetId) : null,
  categoryName: form.budgetId && form.type !== 'received' ? form.categoryName.trim() || null : null,
});

function Transactions() {
  const dispatch = useDispatch();
  const { items, total, totals, counts, loaded, loading, error } = useSelector((state) => state.transaction);
  const budgets = useSelector((state) => state.budget.items);
  const { activeId, currency } = useWorkspace();
  const [month, setMonth] = useState(currentMonth());
  const [type, setType] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Waits for a pause in typing so each keystroke doesn't trigger a request.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      const result = await fetchTransactions({
        month,
        type: type || undefined,
        budget: budgetFilter || undefined,
        search: search || undefined,
        page,
        limit: perPage,
      });
      dispatch(setTransactions(result));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, month, type, budgetFilter, search, page, perPage, activeId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        dispatch(setBudgets(await fetchBudgets()));
      } catch (err) {
        // Linking is optional, so the page still works without budgets.
        logger.warn('Could not load budgets', getErrorMessage(err));
      }
    };
    loadBudgets();
  }, [dispatch, activeId]);

  const reset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  const changeMonth = (next) => {
    if (!next) return;
    setMonth(next);
    setBudgetFilter('');
    setPage(1);
  };

  const save = async (id, payload, message) => {
    try {
      setSaving(true);
      if (id) await updateTransaction(id, payload);
      else await createTransaction(payload);
      toast.success(message);
      setForm(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    save(form.id, payloadFrom(form), form.id ? 'Transaction updated.' : 'Transaction added.');
  };

  const markSent = (item) =>
    save(
      item.id,
      payloadFrom({ ...item, type: 'sent', budgetId: item.budgetId ? String(item.budgetId) : '', categoryName: item.categoryName ?? '' }),
      item.budgetId && item.categoryName ? `Marked as sent and counted in "${item.budgetName}".` : 'Marked as sent.',
    );

  const confirmDelete = async () => {
    try {
      await deleteTransaction(pendingDelete.id);
      toast.success(pendingDelete.budgetId && pendingDelete.type === 'sent' ? 'Transaction and its budget expense deleted.' : 'Transaction deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPendingDelete(null);
  };

  const exportExcel = () =>
    downloadFile('/integrations/export/transactions.xlsx', 'transactions.xlsx').catch((err) => toast.error(getErrorMessage(err)));

  const newTransaction = () => setForm({ ...EMPTY, date: month === currentMonth() ? today() : `${month}-01` });
  const editTransaction = (item) =>
    setForm({ ...item, budgetId: item.budgetId ? String(item.budgetId) : '', categoryName: item.categoryName ?? '' });

  const monthBudgets = budgets.filter((budget) => budget.month === month);
  const hasFilters = Boolean(type || budgetFilter || search);
  const allCount = counts.received + counts.sent + counts.pending;

  let table;
  if (error && !loaded) {
    table = <ErrorState message={error} onRetry={load} />;
  } else if (!loaded) {
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
        icon={hasFilters ? LuSearch : LuArrowLeftRight}
        title={hasFilters ? 'No matching transactions' : `No transactions in ${formatMonth(month)}`}
        description={hasFilters ? 'Try a different search, type or budget.' : 'Add one here, or import a spreadsheet from Integrations.'}
        action={
          !hasFilters && (
            <Button onClick={newTransaction}>
              <LuPlus className="size-4" aria-hidden="true" /> Add transaction
            </Button>
          )
        }
      />
    );
  } else {
    table = (
      <>
        <div className="relative overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-line text-ink-3 border-b text-xs">
                <th scope="col" className="w-32 px-5 py-3 font-medium">Date</th>
                <th scope="col" className="px-5 py-3 font-medium">Details</th>
                <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">Budget</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Amount</th>
                <th scope="col" className="w-36 px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {items.map((item) => (
                <TransactionRow
                  key={item.id}
                  item={item}
                  currency={currency}
                  onEdit={editTransaction}
                  onDelete={setPendingDelete}
                  onMarkSent={markSent}
                />
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={total}
          perPage={perPage}
          noun="transactions"
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
      <title>Transactions — Budget Book</title>
      <PageHeader title="Transactions" subtitle="Money in and out. Link one to a budget and it counts there too.">
        <Button variant="secondary" onClick={exportExcel}>
          <LuDownload className="size-4" aria-hidden="true" /> Export
        </Button>
        <Button onClick={newTransaction}>
          <LuPlus className="size-4" aria-hidden="true" /> Add transaction
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
            aria-label="Search transactions"
            placeholder="Search name, note or category"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="border-line bg-surface h-10 w-full rounded-lg border pr-3 pl-9 text-sm"
          />
        </div>
        <select
          aria-label="Filter by budget"
          value={budgetFilter}
          onChange={(event) => reset(setBudgetFilter)(event.target.value)}
          className="border-line bg-surface h-10 rounded-lg border px-3 text-sm"
        >
          <option value="">All budgets</option>
          {monthBudgets.map((budget) => (
            <option key={budget.id} value={budget.id}>
              {budget.name}
            </option>
          ))}
          <option value={UNASSIGNED}>Not linked</option>
        </select>
      </div>

      <div className={`space-y-4 transition-opacity ${loading && loaded ? 'opacity-60' : ''}`}>
        <Card>
          <div className="divide-line grid grid-cols-2 divide-x md:grid-cols-4">
            <Kpi label="Money in" value={formatMoney(totals.received, currency)} detail={`${counts.received} received`} tone="text-good" />
            <Kpi label="Money out" value={formatMoney(totals.sent, currency)} detail={`${counts.sent} sent`} />
            <Kpi label="Pending" value={formatMoney(totals.pending, currency)} detail={`${counts.pending} not yet paid`} />
            <Kpi
              label="Net"
              value={`${totals.net < 0 ? '−' : ''}${formatMoney(Math.abs(totals.net), currency)}`}
              detail="Money in minus money out"
              tone={totals.net < 0 ? 'text-critical' : ''}
            />
          </div>
        </Card>

        <Card>
          <div className="border-line flex flex-wrap gap-1 border-b px-4 pt-3" role="tablist" aria-label="Transaction type">
            {TABS.map((tab) => {
              const count = tab.value ? counts[tab.value] : allCount;
              const active = type === tab.value;
              return (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => reset(setType)(tab.value)}
                  className={`-mb-px border-b-2 px-3 pb-2.5 text-sm transition-colors ${
                    active ? 'border-accent-text text-ink font-medium' : 'text-ink-2 hover:text-ink border-transparent'
                  }`}
                >
                  {tab.label}
                  <span className="text-ink-3 tabular ml-1.5 text-xs">{count}</span>
                </button>
              );
            })}
          </div>
          {table}
        </Card>
      </div>

      <Modal
        open={Boolean(form)}
        size="lg"
        title={form?.id ? 'Edit transaction' : 'Add transaction'}
        description={form?.id ? undefined : 'Link it to a budget to count it there as an expense or as income.'}
        onClose={() => setForm(null)}
      >
        {form && (
          <TransactionForm
            form={form}
            setForm={setForm}
            budgets={budgets}
            saving={saving}
            onSubmit={submit}
            onCancel={() => setForm(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this transaction?"
        message={
          pendingDelete?.budgetId && pendingDelete?.type === 'sent'
            ? `The ${formatMoney(pendingDelete.amount, currency)} payment and the expense it added to "${pendingDelete.budgetName}" will be removed.`
            : `The ${formatMoney(pendingDelete?.amount, currency)} transaction will be removed.`
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default Transactions;
