import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { LuBell, LuCheck, LuPencil, LuTrash2 } from 'react-icons/lu';
import { createReminder, deleteReminder, fetchReminders, updateReminder } from '../../api/workspaceApi';
import { getErrorMessage } from '../../api/client';
import { setError, setLoading, setReminders } from '../../redux/features/reminderSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import { formatDate, today } from '../../lib/format';
import { Card, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { ConfirmDialog } from '../../components/ui/Modal';
import { Badge, EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';

const EMPTY = { title: '', dueDate: '' };

function Reminders() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.reminder);
  const { activeId } = useWorkspace();
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      dispatch(setReminders(await fetchReminders()));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activeId]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      if (editingId) await updateReminder(editingId, form);
      else await createReminder(form);
      toast.success(editingId ? 'Reminder updated.' : 'Reminder added.');
      resetForm();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const markDone = async (id) => {
    try {
      await updateReminder(id, { status: 'done' });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteReminder(pendingDelete.id);
      toast.success('Reminder deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPendingDelete(null);
  };

  const now = today();
  const dueTone = (item) => {
    if (item.status === 'done') return 'good';
    return item.dueDate < now ? 'critical' : 'neutral';
  };

  return (
    <>
      <title>Reminders — Budget Book</title>
      <PageHeader title="Reminders" subtitle="Bills and financial dates you can't miss." />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {error ? (
            <ErrorState message={error} onRetry={load} />
          ) : loading && items.length === 0 ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : items.length === 0 ? (
            <EmptyState icon={LuBell} title="No reminders" description="Add your first bill or due date." />
          ) : (
            <ul className="divide-line divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium ${item.status === 'done' ? 'text-ink-3 line-through' : ''}`}>
                      {item.title}
                    </p>
                    <p className="mt-1">
                      <Badge tone={dueTone(item)}>
                        {item.status === 'done' ? 'Done' : item.dueDate < now ? 'Overdue' : 'Due'} · {formatDate(item.dueDate)}
                      </Badge>
                    </p>
                  </div>
                  {item.status === 'pending' && (
                    <>
                      <IconButton label={`Mark ${item.title} as done`} onClick={() => markDone(item.id)}>
                        <LuCheck className="size-4" />
                      </IconButton>
                      <IconButton
                        label={`Edit ${item.title}`}
                        onClick={() => {
                          setEditingId(item.id);
                          setForm({ title: item.title, dueDate: item.dueDate });
                        }}
                      >
                        <LuPencil className="size-4" />
                      </IconButton>
                    </>
                  )}
                  <IconButton label={`Delete ${item.title}`} onClick={() => setPendingDelete(item)}>
                    <LuTrash2 className="size-4" />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title={editingId ? 'Edit reminder' : 'New reminder'} />
          <form onSubmit={submit} className="space-y-4 p-5">
            <Input label="Title" required maxLength={255} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <Input label="Due date" type="date" required value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
            <div className="flex gap-2">
              <Button type="submit" loading={saving} className="flex-1">
                {editingId ? 'Save' : 'Add reminder'}
              </Button>
              {editingId && (
                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this reminder?"
        message={`"${pendingDelete?.title}" will be removed.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default Reminders;
