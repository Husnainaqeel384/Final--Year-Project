import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { LuPencil, LuStickyNote, LuTrash2 } from 'react-icons/lu';
import { createNote, deleteNote, fetchNotes, updateNote } from '../../api/workspaceApi';
import { getErrorMessage } from '../../api/client';
import { setError, setLoading, setNotes } from '../../redux/features/noteSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import { formatDate } from '../../lib/format';
import { Card, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Field';
import { ConfirmDialog } from '../../components/ui/Modal';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';

function Notes() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.note);
  const { activeId } = useWorkspace();
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      dispatch(setNotes(await fetchNotes()));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activeId]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setBody('');
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      if (editingId) await updateNote(editingId, body);
      else await createNote(body);
      toast.success(editingId ? 'Note updated.' : 'Note added.');
      resetForm();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteNote(pendingDelete.id);
      toast.success('Note deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPendingDelete(null);
  };

  return (
    <>
      <title>Notes — Budget Book</title>
      <PageHeader title="Notes" subtitle="Keep money thoughts next to your numbers." />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {error ? (
            <Card>
              <ErrorState message={error} onRetry={load} />
            </Card>
          ) : loading && items.length === 0 ? (
            <Skeleton className="h-40" />
          ) : items.length === 0 ? (
            <Card>
              <EmptyState icon={LuStickyNote} title="No notes yet" description="Write your first note on this page." />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((note) => (
                <Card key={note.id} className="flex flex-col p-4">
                  <p className="flex-1 text-sm leading-6 whitespace-pre-wrap">{note.body}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-ink-3 text-xs">{formatDate(note.updatedAt)}</span>
                    <span>
                      <IconButton
                        label="Edit note"
                        onClick={() => {
                          setEditingId(note.id);
                          setBody(note.body);
                        }}
                      >
                        <LuPencil className="size-4" />
                      </IconButton>
                      <IconButton label="Delete note" onClick={() => setPendingDelete(note)}>
                        <LuTrash2 className="size-4" />
                      </IconButton>
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardHeader title={editingId ? 'Edit note' : 'New note'} />
          <form onSubmit={submit} className="space-y-4 p-5">
            <Textarea label="Note" rows={6} required maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} />
            <div className="flex gap-2">
              <Button type="submit" loading={saving} className="flex-1">
                {editingId ? 'Save' : 'Add note'}
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
        title="Delete this note?"
        message="This note will be removed."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default Notes;
