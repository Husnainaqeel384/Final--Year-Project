import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { LuArrowLeftRight, LuDownload, LuPencil, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from '../../api/financeApi';
import { downloadFile, getErrorMessage } from '../../api/client';
import { setError, setLoading, setTransactions } from '../../redux/features/transactionSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import { formatDate, formatMoney, today } from '../../lib/format';
import { Card, PageHeader } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { Badge, EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import { Table, Td } from '../../components/ui/Table';

const PAGE_SIZE = 15;
const TYPE_TONES = { sent: 'neutral', received: 'good', pending: 'warning' };
const EMPTY = { type: 'sent', date: '', amount: '', sender: '', receiver: '', method: '', description: '' };

function Transactions() {
  const dispatch = useDispatch();
  const { items, total, loading, error } = useSelector((state) => state.transaction);
  const { activeId, currency } = useWorkspace();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Waits for a pause in typing so each keystroke doesn't trigger a request.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      dispatch(setTransactions(await fetchTransactions({ search, type, page, limit: PAGE_SIZE })));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, search, type, page, activeId]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form, amount: Number(form.amount) };
    delete payload.id;
    try {
      setSaving(true);
      if (form.id) await updateTransaction(form.id, payload);
      else await createTransaction(payload);
      toast.success(form.id ? 'Transaction updated.' : 'Transaction added.');
      setForm(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteTransaction(pendingDelete.id);
      toast.success('Transaction deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPendingDelete(null);
  };

  const exportExcel = () =>
    downloadFile('/integrations/export/transactions.xlsx', 'transactions.xlsx').catch((err) =>
      toast.error(getErrorMessage(err)),
    );

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(search || type);

  return (
    <>
      <title>Transactions — Budget Book</title>
      <PageHeader title="Transactions" subtitle="Money sent, received and pending.">
        <Button variant="secondary" onClick={exportExcel}>
          <LuDownload className="size-4" aria-hidden="true" /> Export
        </Button>
        <Button onClick={() => setForm({ ...EMPTY, date: today() })}>
          <LuPlus className="size-4" aria-hidden="true" /> Add transaction
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1 sm:max-w-sm">
          <LuSearch className="text-ink-3 absolute top-3 left-3 size-4" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search transactions"
            placeholder="Search name, method or note"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="border-line bg-surface h-10 w-full rounded-lg border pr-3 pl-9 text-sm"
          />
        </div>
        <select
          aria-label="Filter by type"
          value={type}
          onChange={(event) => {
            setType(event.target.value);
            setPage(1);
          }}
          className="border-line bg-surface h-10 rounded-lg border px-3 text-sm"
        >
          <option value="">All types</option>
          <option value="sent">Sent</option>
          <option value="received">Received</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <Card>
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : loading && items.length === 0 ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={LuArrowLeftRight}
            title={hasFilters ? 'No matching transactions' : 'No transactions yet'}
            description={hasFilters ? 'Try a different search or filter.' : 'Add one here, or import a spreadsheet from Integrations.'}
          />
        ) : (
          <>
            <Table
              head={[
                { label: 'Date' },
                { label: 'Type' },
                { label: 'From' },
                { label: 'To' },
                { label: 'Method' },
                { label: 'Amount', right: true },
                { label: 'Actions', right: true },
              ]}
            >
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-2/50">
                  <Td className="text-ink-2 whitespace-nowrap">{formatDate(item.date)}</Td>
                  <Td>
                    <span className="capitalize">
                      <Badge tone={TYPE_TONES[item.type]}>{item.type}</Badge>
                    </span>
                  </Td>
                  <Td>{item.sender}</Td>
                  <Td>{item.receiver}</Td>
                  <Td className="text-ink-2">{item.method}</Td>
                  <Td right>{formatMoney(item.amount, currency)}</Td>
                  <Td right>
                    <IconButton label="Edit transaction" onClick={() => setForm({ ...item })}>
                      <LuPencil className="size-4" />
                    </IconButton>
                    <IconButton label="Delete transaction" onClick={() => setPendingDelete(item)}>
                      <LuTrash2 className="size-4" />
                    </IconButton>
                  </Td>
                </tr>
              ))}
            </Table>
            <div className="border-line flex items-center justify-between border-t px-5 py-3 text-sm">
              <span className="text-ink-3 tabular">
                Page {page} of {pages} · {total} total
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <Modal open={Boolean(form)} title={form?.id ? 'Edit transaction' : 'Add transaction'} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Type" name="type" required value={form.type} onChange={update}>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
                <option value="pending">Pending</option>
              </Select>
              <Input label="Date" name="date" type="date" required value={form.date} onChange={update} />
              <Input label="From" name="sender" required maxLength={100} value={form.sender} onChange={update} />
              <Input label="To" name="receiver" required maxLength={100} value={form.receiver} onChange={update} />
              <Input label="Amount" name="amount" type="number" min="0.01" step="0.01" required value={form.amount} onChange={update} />
              <Input label="Payment method" name="method" required maxLength={60} placeholder="Bank, card, cash" value={form.method} onChange={update} />
            </div>
            <Textarea label="Note (optional)" name="description" rows={2} maxLength={255} value={form.description} onChange={update} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" loading={saving}>Save</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this transaction?"
        message={`The ${formatMoney(pendingDelete?.amount, currency)} transaction will be removed.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default Transactions;
