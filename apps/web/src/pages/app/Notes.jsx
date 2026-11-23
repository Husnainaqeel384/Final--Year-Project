import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { LuPencil, LuPin, LuPinOff, LuSearch, LuStickyNote, LuTrash2, LuX } from 'react-icons/lu';
import { createNote, deleteNote, fetchNotes, updateNote } from '../../api/workspaceApi';
import { getErrorMessage } from '../../api/client';
import { setError, setLoading, setNotes } from '../../redux/features/noteSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import { formatDate } from '../../lib/format';
import { Card, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Field';
import { ConfirmDialog } from '../../components/ui/Modal';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';

const EMPTY = { title: '', body: '', pinned: false };
const MAX_BODY = 2000;
// Longer notes start folded so one long note doesn't push the rest out of view.
const isLong = (body) => body.length > 280 || body.split('\n').length > 6;

function NoteCard({ note, expanded, onToggle, onPin, onEdit, onDelete }) {
  return (
    <Card className={`flex flex-col p-4 ${note.pinned ? 'border-accent-soft' : ''}`}>
      <div className="flex flex-1 items-start gap-2">
        <div className="min-w-0 flex-1">
          {note.title && <h3 className="font-semibold wrap-anywhere">{note.title}</h3>}
          <p className={`text-ink-2 text-sm leading-6 whitespace-pre-wrap wrap-anywhere ${note.title ? 'mt-1' : ''} ${expanded ? '' : 'line-clamp-6'}`}>
            {note.body}
          </p>
          {isLong(note.body) && (
            <button type="button" onClick={onToggle} className="text-accent-text mt-1 text-xs font-medium">
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
        <IconButton label={note.pinned ? 'Unpin note' : 'Pin note'} onClick={onPin} className={note.pinned ? 'text-accent-text' : ''}>
          {note.pinned ? <LuPinOff className="size-4" /> : <LuPin className="size-4" />}
        </IconButton>
      </div>
      <div className="border-line mt-3 flex items-center justify-between border-t pt-2">
        <span className="text-ink-3 text-xs">Edited {formatDate(note.updatedAt)}</span>
        <span className="flex">
          <IconButton label="Edit note" onClick={onEdit}>
            <LuPencil className="size-4" />
          </IconButton>
          <IconButton label="Delete note" onClick={onDelete}>
            <LuTrash2 className="size-4" />
          </IconButton>
        </span>
      </div>
    </Card>
  );
}

function NoteGroup({ label, notes, expanded, onToggle, onPin, onEdit, onDelete }) {
  return (
    <section aria-label={label}>
      <h2 className="text-ink-3 mb-2 text-xs font-medium tracking-wide uppercase">{label}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            expanded={expanded.has(note.id)}
            onToggle={() => onToggle(note.id)}
            onPin={() => onPin(note)}
            onEdit={() => onEdit(note)}
            onDelete={() => onDelete(note)}
          />
        ))}
      </div>
    </section>
  );
}

function Notes() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.note);
  const { activeId } = useWorkspace();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());
  const formRef = useRef(null);
  const formTopRef = useRef(null);

  // Waits for a pause in typing so each keystroke doesn't trigger a request.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      dispatch(setNotes(await fetchNotes({ search: search || undefined })));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
    // activeId: switching workspace shows that workspace's notes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, search, activeId]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    const note = { title: form.title.trim(), body: form.body, pinned: form.pinned };
    try {
      setSaving(true);
      if (editingId) await updateNote(editingId, note);
      else await createNote(note);
      toast.success(editingId ? 'Note updated.' : 'Note added.');
      resetForm();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Ctrl or Cmd + Enter saves from inside the text box.
  const saveShortcut = (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) formRef.current?.requestSubmit();
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setForm({ title: note.title, body: note.body, pinned: note.pinned });
    // On a phone the form sits above the list, so bring it into view.
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const togglePin = async (note) => {
    try {
      await updateNote(note.id, { pinned: !note.pinned });
      toast.success(note.pinned ? 'Note unpinned.' : 'Note pinned to the top.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const toggleExpanded = (id) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const confirmDelete = async () => {
    try {
      await deleteNote(pendingDelete.id);
      toast.success('Note deleted.');
      if (pendingDelete.id === editingId) resetForm();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPendingDelete(null);
  };

  const pinned = items.filter((note) => note.pinned);
  const others = items.filter((note) => !note.pinned);
  const groupProps = { expanded, onToggle: toggleExpanded, onPin: togglePin, onEdit: startEdit, onDelete: setPendingDelete };

  let list;
  if (error) {
    list = (
      <Card>
        <ErrorState message={error} onRetry={load} />
      </Card>
    );
  } else if (loading && items.length === 0) {
    list = (
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    );
  } else if (items.length === 0) {
    list = (
      <Card>
        {search ? (
          <EmptyState icon={LuSearch} title={`No notes match "${search}"`} description="Try a different word, or clear the search." />
        ) : (
          <EmptyState icon={LuStickyNote} title="No notes yet" description="Write down decisions, plans or anything to remember about your money." />
        )}
      </Card>
    );
  } else {
    list = (
      <div className={`space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
        {pinned.length > 0 && <NoteGroup label="Pinned" notes={pinned} {...groupProps} />}
        {others.length > 0 && <NoteGroup label={pinned.length > 0 ? 'Other notes' : 'All notes'} notes={others} {...groupProps} />}
      </div>
    );
  }

  return (
    <>
      <title>Notes — Budget Book</title>
      <PageHeader title="Notes" subtitle="Plans, decisions and reminders to yourself about money." />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="relative sm:max-w-sm">
            <LuSearch className="text-ink-3 absolute top-3 left-3 size-4" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search notes"
              placeholder="Search titles and text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="border-line bg-surface h-10 w-full rounded-lg border pr-3 pl-9 text-sm"
            />
          </div>
          {list}
        </div>

        <Card className="max-lg:order-first lg:sticky lg:top-20">
          <div ref={formTopRef} className="scroll-mt-20">
            <CardHeader
              title={editingId ? 'Edit note' : 'New note'}
              action={
                editingId && (
                  <IconButton label="Stop editing" onClick={resetForm}>
                    <LuX className="size-4" />
                  </IconButton>
                )
              }
            />
          </div>
          <form ref={formRef} onSubmit={submit} className="space-y-4 p-5">
            <Input
              label="Title (optional)"
              maxLength={120}
              placeholder="e.g. Holiday savings plan"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
            <Textarea
              label="Note"
              rows={6}
              required
              maxLength={MAX_BODY}
              value={form.body}
              onKeyDown={saveShortcut}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
              hint={`${form.body.length} / ${MAX_BODY} characters · Ctrl + Enter to save`}
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(event) => setForm({ ...form, pinned: event.target.checked })}
                className="accent-accent size-4"
              />
              Pin to the top
            </label>
            <div className="flex gap-2">
              <Button type="submit" loading={saving} className="flex-1">
                {editingId ? 'Save changes' : 'Add note'}
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
        message={pendingDelete?.title ? `"${pendingDelete.title}" will be removed.` : 'This note will be removed.'}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default Notes;
