import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuBell,
  LuCalendarCheck,
  LuCalendarClock,
  LuCheck,
  LuPencil,
  LuPlus,
  LuRepeat,
  LuRotateCcw,
  LuSearch,
  LuTrash2,
} from 'react-icons/lu';
import { createReminder, deleteReminder, fetchReminders, reopenReminder, updateReminder } from '../../api/workspaceApi';
import { getErrorMessage } from '../../api/client';
import { setError, setLoading, setReminders } from '../../redux/features/reminderSlice';
import { refreshAlerts } from '../../redux/features/notificationSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import { daysUntil, describeDue, formatDate, formatMoney, today } from '../../lib/format';
import { groupByDue, nextDueDate } from '../../lib/reminders';
import { Card, PageHeader } from '../../components/ui/Card';
import { Button, IconButton, buttonClass } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Field';
import { CategorySelect } from '../../components/ui/CategorySelect';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { Badge, EmptyState, ErrorState, InfoNote, Skeleton } from '../../components/ui/Feedback';
import { Pagination } from '../../components/ui/Pagination';
import { Segmented } from '../../components/ui/Segmented';
import MarkPaidDialog from '../../components/reminders/MarkPaidDialog';

const FREQUENCIES = [
  { value: 'none', label: 'Once' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];
const FREQUENCY_LABEL = { weekly: 'Every week', monthly: 'Every month', yearly: 'Every year' };
const TABS = [
  { value: 'open', label: 'Upcoming' },
  { value: 'done', label: 'Done' },
];
const EMPTY = { title: '', dueDate: today(), amount: '', categoryName: '', frequency: 'none', note: '' };

const dueCount = (count) => `${count} ${count === 1 ? 'reminder' : 'reminders'}`;

function Kpi({ label, figure, currency, detail, tone = '' }) {
  return (
    <div className="px-5 py-4">
      <p className="text-ink-2 text-[13px]">{label}</p>
      <p className={`mt-1 text-xl font-semibold tracking-tight ${figure.count > 0 ? tone : ''}`}>
        {formatMoney(figure.amount, currency)}
      </p>
      <p className="text-ink-3 mt-0.5 text-xs">
        {detail(figure.count)}
      </p>
    </div>
  );
}

/** A small calendar page, so dates can be scanned down the list at a glance. */
function DateTile({ value, muted = false }) {
  const date = new Date(`${value}T12:00:00`);
  return (
    <span
      className={`border-line flex w-11 shrink-0 flex-col items-center overflow-hidden rounded-lg border text-center ${muted ? 'opacity-60' : ''}`}
      aria-hidden="true"
    >
      <span className="bg-surface-2 text-ink-2 w-full py-0.5 text-[10px] font-semibold tracking-wide uppercase">
        {date.toLocaleDateString(undefined, { month: 'short' })}
      </span>
      <span className="tabular py-0.5 text-base leading-tight font-semibold">{date.getDate()}</span>
    </span>
  );
}

function DueLabel({ dueDate }) {
  const days = daysUntil(dueDate);
  const text = days < 0 ? describeDue(dueDate) : days <= 1 ? `Due ${describeDue(dueDate).toLowerCase()}` : describeDue(dueDate);
  if (days > 1) return <span className="text-ink-3 text-xs whitespace-nowrap">{text}</span>;
  return (
    <span className="whitespace-nowrap">
      <Badge tone={days < 0 ? 'critical' : 'warning'}>{text}</Badge>
    </span>
  );
}

function Details({ item }) {
  const meta = [FREQUENCY_LABEL[item.frequency], item.categoryName, item.note].filter(Boolean).join(' · ');
  return (
    <div className="min-w-0">
      <p className="truncate font-medium">{item.title}</p>
      {meta && (
        <p className="text-ink-3 flex min-w-0 items-center gap-1 text-xs">
          {item.frequency !== 'none' && <LuRepeat className="size-3 shrink-0" aria-hidden="true" />}
          <span className="truncate">{meta}</span>
        </p>
      )}
    </div>
  );
}

// Phones get tighter padding, and the amount moves under the title instead of taking a column.
const CELL = 'px-2 py-3 sm:px-5';
const FIRST_CELL = 'py-3 pr-2 pl-4 sm:px-5';

function OpenRow({ item, currency, onPay, onEdit, onDelete }) {
  const amount = item.amount ? formatMoney(item.amount, currency) : null;
  return (
    <tr className="hover:bg-surface-2/50">
      <td className={FIRST_CELL}>
        <div className="flex items-center gap-3">
          <DateTile value={item.dueDate} />
          <div className="hidden sm:block">
            <DueLabel dueDate={item.dueDate} />
          </div>
        </div>
      </td>
      <td className={`max-w-0 ${CELL}`}>
        <Details item={item} />
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 sm:hidden">
          <DueLabel dueDate={item.dueDate} />
          {amount && <span className="tabular text-xs font-semibold">{amount}</span>}
        </div>
      </td>
      <td className="tabular hidden px-5 py-3 text-right font-semibold whitespace-nowrap sm:table-cell">
        {amount ?? <span className="text-ink-3 font-normal">—</span>}
      </td>
      <td className="py-3 pr-3 pl-1 text-right whitespace-nowrap sm:px-4">
        <Button variant="secondary" size="sm" onClick={() => onPay(item)} aria-label={`Mark ${item.title} as done`}>
          <LuCheck className="size-4" aria-hidden="true" />
          <span className="hidden md:inline">{item.amount ? 'Mark paid' : 'Done'}</span>
        </Button>
        <IconButton label={`Edit ${item.title}`} onClick={() => onEdit(item)}>
          <LuPencil className="size-4" />
        </IconButton>
        <IconButton label={`Delete ${item.title}`} onClick={() => onDelete(item)}>
          <LuTrash2 className="size-4" />
        </IconButton>
      </td>
    </tr>
  );
}

function DoneRow({ item, currency, onReopen, onDelete }) {
  const amount = item.paidAmount ?? item.amount;
  return (
    <tr className="hover:bg-surface-2/50">
      <td className={FIRST_CELL}>
        <div className="flex items-center gap-3">
          <DateTile value={item.completedOn ?? item.dueDate} muted />
          <span className="text-ink-3 hidden text-xs whitespace-nowrap sm:inline">Due {formatDate(item.dueDate)}</span>
        </div>
      </td>
      <td className={`max-w-0 ${CELL}`}>
        <Details item={item} />
        {amount && <p className="tabular text-ink-2 mt-1 text-xs sm:hidden">{formatMoney(amount, currency)}</p>}
      </td>
      <td className="hidden px-5 py-3 whitespace-nowrap lg:table-cell">
        {item.budgetName ? (
          <Link to={`/app/budgets/${item.budgetId}`} className="inline-flex flex-col">
            <span className="bg-accent-soft text-accent-text w-fit rounded px-1.5 py-0.5 text-xs font-medium">{item.budgetName}</span>
            <span className="text-ink-3 mt-0.5 text-xs">Paid · in budget</span>
          </Link>
        ) : item.transactionId ? (
          <Link to="/app/transactions" className="text-accent-text text-xs font-medium">
            Payment recorded
          </Link>
        ) : (
          <span className="text-ink-3 text-xs">Marked done</span>
        )}
      </td>
      <td className="tabular text-ink-2 hidden px-5 py-3 text-right whitespace-nowrap sm:table-cell">
        {amount ? formatMoney(amount, currency) : '—'}
      </td>
      <td className="py-3 pr-3 pl-1 text-right whitespace-nowrap sm:px-4">
        <IconButton label={`Reopen ${item.title}`} onClick={() => onReopen(item)}>
          <LuRotateCcw className="size-4" />
        </IconButton>
        <IconButton label={`Delete ${item.title}`} onClick={() => onDelete(item)}>
          <LuTrash2 className="size-4" />
        </IconButton>
      </td>
    </tr>
  );
}

function ReminderForm({ form, setForm, saving, onSubmit, onCancel }) {
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const repeating = form.frequency !== 'none';

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Input label="What is it?" name="title" required maxLength={255} placeholder="Electricity bill" value={form.title} onChange={update} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Due date" name="dueDate" type="date" required value={form.dueDate} onChange={update} />
        <Input
          label="Amount (optional)"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          hint="Leave empty for dates that aren't bills."
          value={form.amount}
          onChange={update}
        />
      </div>
      <Segmented legend="Repeats" name="frequency" options={FREQUENCIES} value={form.frequency} onChange={(frequency) => setForm({ ...form, frequency })} />
      <CategorySelect label="Category (optional)" required={false} value={form.categoryName} onChange={(categoryName) => setForm({ ...form, categoryName })} />
      <Textarea label="Note (optional)" name="note" rows={2} maxLength={255} placeholder="Account number, website, who to call" value={form.note} onChange={update} />

      {repeating && form.dueDate && (
        <InfoNote>
          {FREQUENCY_LABEL[form.frequency]}. When you mark it done, the next one appears for{' '}
          <strong className="text-ink font-medium">{formatDate(nextDueDate(form.dueDate, form.frequency))}</strong>.
        </InfoNote>
      )}

      <div className="border-line flex justify-end gap-2 border-t pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {form.id ? 'Save' : 'Add reminder'}
        </Button>
      </div>
    </form>
  );
}

const reminderPayload = (form) => ({
  title: form.title.trim(),
  dueDate: form.dueDate,
  amount: form.amount === '' ? null : Number(form.amount),
  categoryName: form.categoryName.trim() || null,
  frequency: form.frequency,
  note: form.note.trim(),
});

function Reminders() {
  const dispatch = useDispatch();
  const { items, total, counts, summary, loaded, loading, error } = useSelector((state) => state.reminder);
  const version = useSelector((state) => state.notification.version);
  const { activeId, currency } = useWorkspace();
  const [status, setStatus] = useState('open');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [form, setForm] = useState(null);
  const [completing, setCompleting] = useState(null);
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
      // The browser's date decides what is overdue, not the server's time zone.
      dispatch(setReminders(await fetchReminders({ status, search: search || undefined, page, limit: perPage, today: today() })));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
    // activeId and version: a workspace switch or a reminder changed anywhere (even from the bell) refetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, status, search, page, perPage, activeId, version]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (action, message) => {
    try {
      setSaving(true);
      const result = await action();
      toast.success(typeof message === 'function' ? message(result) : message);
      // Reloads this list, the bell and the dashboard together.
      dispatch(refreshAlerts());
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submitReminder = async (event) => {
    event.preventDefault();
    const payload = reminderPayload(form);
    const ok = await run(
      () => (form.id ? updateReminder(form.id, payload) : createReminder(payload)),
      form.id ? 'Reminder updated.' : 'Reminder added.',
    );
    if (ok) setForm(null);
  };

  const reopen = (item) =>
    run(
      () => reopenReminder(item.id),
      (result) => (result.keptTransaction ? 'Reopened. The payment is still in Transactions.' : 'Reopened.'),
    );

  const confirmDelete = async () => {
    await run(() => deleteReminder(pendingDelete.id), 'Reminder deleted.');
    setPendingDelete(null);
  };

  const changeTab = (value) => {
    setStatus(value);
    setPage(1);
  };

  const newReminder = () => setForm({ ...EMPTY, dueDate: today() });
  const editReminder = (item) =>
    setForm({
      id: item.id,
      title: item.title,
      dueDate: item.dueDate,
      amount: item.amount ? String(item.amount) : '',
      categoryName: item.categoryName ?? '',
      frequency: item.frequency,
      note: item.note ?? '',
    });

  const done = status === 'done';
  const columns = done ? 5 : 4;

  let list;
  if (error && !loaded) {
    list = <ErrorState message={error} onRetry={load} />;
  } else if (!loaded) {
    list = (
      <div className="space-y-3 p-5">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  } else if (items.length === 0) {
    list = (
      <EmptyState
        icon={search ? LuSearch : done ? LuCalendarCheck : LuBell}
        title={search ? 'No matching reminders' : done ? 'Nothing done yet' : "You're all caught up"}
        description={
          search
            ? 'Try a different search.'
            : done
              ? 'Reminders you mark as done or paid will show here.'
              : 'Add bills and dates so they show up here before they are due.'
        }
        action={
          !search &&
          !done && (
            <Button onClick={newReminder}>
              <LuPlus className="size-4" aria-hidden="true" /> Add reminder
            </Button>
          )
        }
      />
    );
  } else {
    const rows = done
      ? items.map((item) => <DoneRow key={item.id} item={item} currency={currency} onReopen={reopen} onDelete={setPendingDelete} />)
      : groupByDue(items, daysUntil).flatMap((group) => [
          <tr key={group.key} className="bg-surface-2/60">
            <th scope="colgroup" colSpan={columns} className={`px-5 py-1.5 text-left text-xs font-semibold ${group.key === 'overdue' ? 'text-critical' : 'text-ink-2'}`}>
              {group.label}
              <span className="text-ink-3 tabular ml-1.5 font-normal">{group.items.length}</span>
            </th>
          </tr>,
          ...group.items.map((item) => (
            <OpenRow key={item.id} item={item} currency={currency} onPay={setCompleting} onEdit={editReminder} onDelete={setPendingDelete} />
          )),
        ]);

    list = (
      <>
        <div className="relative overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-line text-ink-3 border-b text-xs">
                <th scope="col" className="w-20 py-3 pr-2 pl-4 font-medium sm:w-48 sm:px-5">{done ? 'Done on' : 'Due'}</th>
                <th scope="col" className="px-2 py-3 font-medium sm:px-5">Reminder</th>
                {done && <th scope="col" className="hidden px-5 py-3 font-medium lg:table-cell">Payment</th>}
                <th scope="col" className="hidden px-5 py-3 text-right font-medium sm:table-cell">{done ? 'Paid' : 'Amount'}</th>
                <th scope="col" className={done ? 'w-20 py-3 sm:w-24' : 'w-28 py-3 md:w-52'}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">{rows}</tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={total}
          perPage={perPage}
          noun="reminders"
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
      <title>Reminders — Budget Book</title>
      <meta name="description" content="Bills and due dates in one list. Mark a bill paid and it is saved as a transaction in your budget." />
      <PageHeader title="Reminders" subtitle="Bills and dates you can't miss. Mark a bill paid and it counts in your budget.">
        <Link to="/app/integrations" className={buttonClass('secondary')}>
          <LuCalendarClock className="size-4" aria-hidden="true" /> Calendar feed
        </Link>
        <Button onClick={newReminder}>
          <LuPlus className="size-4" aria-hidden="true" /> Add reminder
        </Button>
      </PageHeader>

      <div className={`space-y-4 transition-opacity ${loading && loaded ? 'opacity-60' : ''}`}>
        <Card>
          <div className="divide-line grid grid-cols-2 divide-x md:grid-cols-4">
            <Kpi label="Overdue" figure={summary.overdue} currency={currency} detail={dueCount} tone="text-critical" />
            <Kpi label="Due in the next 7 days" figure={summary.week} currency={currency} detail={dueCount} />
            <Kpi label="Due in the next 30 days" figure={summary.month} currency={currency} detail={dueCount} />
            <Kpi label="Paid this month" figure={summary.paid} currency={currency} detail={(count) => `${count} done`} tone="text-good" />
          </div>
        </Card>

        <Card>
          <div className="border-line flex flex-wrap items-end justify-between gap-3 border-b px-4 pt-3">
            <div className="flex gap-1" role="tablist" aria-label="Reminder status">
              {TABS.map((tab) => {
                const active = status === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => changeTab(tab.value)}
                    className={`-mb-px border-b-2 px-3 pb-2.5 text-sm transition-colors ${
                      active ? 'border-accent-text text-ink font-medium' : 'text-ink-2 hover:text-ink border-transparent'
                    }`}
                  >
                    {tab.label}
                    <span className="text-ink-3 tabular ml-1.5 text-xs">{counts[tab.value]}</span>
                  </button>
                );
              })}
            </div>
            <div className="relative mb-2.5 w-full sm:w-64">
              <LuSearch className="text-ink-3 absolute top-2.5 left-3 size-4" aria-hidden="true" />
              <input
                type="search"
                aria-label="Search reminders"
                placeholder="Search title, note or category"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="border-line bg-surface h-9 w-full rounded-lg border pr-3 pl-9 text-sm"
              />
            </div>
          </div>
          {list}
        </Card>
      </div>

      <Modal
        open={Boolean(form)}
        size="lg"
        title={form?.id ? 'Edit reminder' : 'Add reminder'}
        description={form?.id ? undefined : 'A bill or any date with money attached. Repeating ones renew when done.'}
        onClose={() => setForm(null)}
      >
        {form && <ReminderForm form={form} setForm={setForm} saving={saving} onSubmit={submitReminder} onCancel={() => setForm(null)} />}
      </Modal>

      <MarkPaidDialog reminder={completing} onClose={() => setCompleting(null)} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this reminder?"
        message={
          pendingDelete?.transactionId
            ? `"${pendingDelete.title}" will be removed. Its payment stays in Transactions.`
            : `"${pendingDelete?.title}" will be removed.`
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default Reminders;
