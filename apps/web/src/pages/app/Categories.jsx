import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';
import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  fetchCategories,
  updateCategory,
  updateSubcategory,
} from '../../api/financeApi';
import { getErrorMessage } from '../../api/client';
import { setCategories, setError, setLoading } from '../../redux/features/categorySlice';
import { Card, PageHeader } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { ErrorState, Skeleton } from '../../components/ui/Feedback';

function Categories() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.category);
  // { kind: 'category' | 'subcategory', id?, categoryId?, name }
  const [editor, setEditor] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      dispatch(setCategories(await fetchCategories()));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editor.kind === 'category') {
        if (editor.id) await updateCategory(editor.id, editor.name);
        else await createCategory(editor.name);
      } else if (editor.id) {
        await updateSubcategory(editor.id, editor.name);
      } else {
        await createSubcategory(editor.categoryId, editor.name);
      }
      toast.success('Saved.');
      setEditor(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    try {
      if (pendingDelete.kind === 'category') await deleteCategory(pendingDelete.id);
      else await deleteSubcategory(pendingDelete.id);
      toast.success('Deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPendingDelete(null);
  };

  return (
    <>
      <title>Categories — Budget Book</title>
      <PageHeader title="Categories" subtitle="The list every budget and expense chooses from.">
        <Button onClick={() => setEditor({ kind: 'category', name: '' })}>
          <LuPlus className="size-4" aria-hidden="true" /> New category
        </Button>
      </PageHeader>

      {error ? (
        <Card>
          <ErrorState message={error} onRetry={load} />
        </Card>
      ) : loading && items.length === 0 ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((category) => (
            <Card key={category.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate font-semibold">{category.name}</h2>
                <span className="shrink-0">
                  <IconButton label={`Add subcategory to ${category.name}`} onClick={() => setEditor({ kind: 'subcategory', categoryId: category.id, name: '' })}>
                    <LuPlus className="size-4" />
                  </IconButton>
                  <IconButton label={`Rename ${category.name}`} onClick={() => setEditor({ kind: 'category', id: category.id, name: category.name })}>
                    <LuPencil className="size-4" />
                  </IconButton>
                  <IconButton label={`Delete ${category.name}`} onClick={() => setPendingDelete({ kind: 'category', id: category.id, name: category.name })}>
                    <LuTrash2 className="size-4" />
                  </IconButton>
                </span>
              </div>
              <ul className="border-line mt-2 border-t pt-2">
                {category.subcategories.map((subcategory) => (
                  <li key={subcategory.id} className="text-ink-2 flex items-center justify-between text-sm">
                    <span className="truncate">{subcategory.name}</span>
                    <span className="shrink-0">
                      <IconButton label={`Rename ${subcategory.name}`} onClick={() => setEditor({ kind: 'subcategory', id: subcategory.id, name: subcategory.name })}>
                        <LuPencil className="size-3.5" />
                      </IconButton>
                      <IconButton label={`Delete ${subcategory.name}`} onClick={() => setPendingDelete({ kind: 'subcategory', id: subcategory.id, name: subcategory.name })}>
                        <LuTrash2 className="size-3.5" />
                      </IconButton>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      <Modal open={Boolean(editor)} title={editor?.id ? 'Rename' : editor?.kind === 'category' ? 'New category' : 'New subcategory'} onClose={() => setEditor(null)}>
        {editor && (
          <form onSubmit={submit} className="space-y-4">
            <Input label="Name" required maxLength={100} value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditor(null)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.name}?`}
        message={
          pendingDelete?.kind === 'category'
            ? 'Its subcategories will be deleted too. Existing budgets and expenses keep their names.'
            : 'Existing budgets and expenses keep this name.'
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default Categories;
