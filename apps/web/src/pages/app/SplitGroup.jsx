import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LuArrowLeft } from 'react-icons/lu';
import { addBill, fetchGroup, settleBill } from '../../api/workspaceApi';
import { getErrorMessage } from '../../api/client';
import { setError, setGroup, setLoading } from '../../redux/features/splitSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import { formatDate, formatMoney } from '../../lib/format';
import { Card, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { Modal } from '../../components/ui/Modal';
import { ErrorState, PageLoader } from '../../components/ui/Feedback';
import { Table, Td } from '../../components/ui/Table';

function SplitGroup() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { group, error } = useSelector((state) => state.split);
  const { currency } = useWorkspace();
  const [bill, setBill] = useState(null);
  const [settle, setSettle] = useState(null);

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      dispatch(setGroup(await fetchGroup(id)));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
  }, [dispatch, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Card>
        <ErrorState message={error} onRetry={load} />
      </Card>
    );
  }
  if (!group || String(group.id) !== id) return <PageLoader />;

  const me = group.members.find((member) => member.isMe);

  const submitBill = async (event) => {
    event.preventDefault();
    try {
      await addBill(id, { amount: Number(bill.amount), mode: bill.mode });
      toast.success('Bill added.');
      setBill(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const submitSettle = async (event) => {
    event.preventDefault();
    try {
      await settleBill(id, Number(settle.amount));
      toast.success('Payment recorded.');
      setSettle(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <title>{`${group.name} — Budget Book`}</title>
      <Link to="/app/splits" className="text-ink-2 hover:text-ink mb-3 inline-flex items-center gap-1 text-sm">
        <LuArrowLeft className="size-4" aria-hidden="true" /> Split bills
      </Link>
      <PageHeader title={group.name} subtitle={`You owe ${formatMoney(me?.balance ?? 0, currency)}`}>
        <Button variant="secondary" disabled={!me || me.balance <= 0} onClick={() => setSettle({ amount: me.balance })}>
          Settle up
        </Button>
        <Button onClick={() => setBill({ amount: '', mode: 'equal' })}>Add bill</Button>
      </PageHeader>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card>
          <Table head={[{ label: 'Member' }, { label: 'Owes', right: true }]}>
            {group.members.map((member) => (
              <tr key={member.id}>
                <Td className="font-medium">
                  {member.username}
                  {member.isMe && <span className="text-ink-3 font-normal"> (you)</span>}
                </Td>
                <Td right>{formatMoney(member.balance, currency)}</Td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Activity" />
          <div className="p-5">
            {group.activity.length === 0 ? (
              <p className="text-ink-2 py-8 text-center text-sm">No bills yet.</p>
            ) : (
              <ul className="divide-line max-h-96 divide-y overflow-y-auto">
                {group.activity.map((entry) => (
                  <li key={entry.id} className="flex justify-between gap-4 py-2.5 text-sm">
                    <span>{entry.description}</span>
                    <span className="text-ink-3 shrink-0 text-xs">{formatDate(entry.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <Modal open={Boolean(bill)} title="Add a bill" onClose={() => setBill(null)}>
        {bill && (
          <form onSubmit={submitBill} className="space-y-4">
            <Input label="Amount" type="number" min="0.01" step="0.01" required value={bill.amount} onChange={(event) => setBill({ ...bill, amount: event.target.value })} />
            <Select label="How to split" value={bill.mode} onChange={(event) => setBill({ ...bill, mode: event.target.value })}>
              <option value="equal">Split equally between everyone</option>
              <option value="paid-by-me">I paid, split between the others</option>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setBill(null)}>Cancel</Button>
              <Button type="submit">Add bill</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={Boolean(settle)} title="Settle up" onClose={() => setSettle(null)}>
        {settle && (
          <form onSubmit={submitSettle} className="space-y-4">
            <Input label="Amount paid" type="number" min="0.01" step="0.01" max={me?.balance} required value={settle.amount} onChange={(event) => setSettle({ amount: event.target.value })} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSettle(null)}>Cancel</Button>
              <Button type="submit">Record payment</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

export default SplitGroup;
