import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { LuTrash2 } from 'react-icons/lu';
import { deleteUser, fetchUsers, updateUserRole } from '../../api/workspaceApi';
import { getErrorMessage } from '../../api/client';
import { setError, setLoading, setUsers } from '../../redux/features/adminSlice';
import { formatDate } from '../../lib/format';
import { Card, PageHeader } from '../../components/ui/Card';
import { IconButton } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Modal';
import { ErrorState, Skeleton } from '../../components/ui/Feedback';
import { Table, Td } from '../../components/ui/Table';

function Users() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      dispatch(setUsers(await fetchUsers()));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (id, role) => {
    try {
      await updateUserRole(id, role);
      toast.success('Role updated.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(pendingDelete.id);
      toast.success('User deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPendingDelete(null);
  };

  return (
    <>
      <title>Users — Budget Book</title>
      <PageHeader title="Users" subtitle={`${users.length} accounts on this installation.`} />
      <Card>
        {error ? (
          <ErrorState message={error} onRetry={load} />
        ) : loading && users.length === 0 ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
        ) : (
          <Table head={[{ label: 'Name' }, { label: 'Username' }, { label: 'Joined' }, { label: 'Role' }, { label: 'Actions', right: true }]}>
            {users.map((user) => (
              <tr key={user.id}>
                <Td>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-ink-3 text-xs">{user.email}</p>
                </Td>
                <Td className="text-ink-2">{user.username}</Td>
                <Td className="text-ink-2 whitespace-nowrap">{formatDate(user.createdAt)}</Td>
                <Td>
                  <select
                    aria-label={`Role for ${user.username}`}
                    value={user.role}
                    disabled={user.id === currentUserId}
                    onChange={(event) => changeRole(user.id, event.target.value)}
                    className="border-line bg-surface h-8 rounded-md border px-2 text-[13px] disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </Td>
                <Td right>
                  {user.id !== currentUserId && (
                    <IconButton label={`Delete ${user.username}`} onClick={() => setPendingDelete(user)}>
                      <LuTrash2 className="size-4" />
                    </IconButton>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this user?"
        message={`${pendingDelete?.username}'s account and personal data will be permanently removed.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default Users;
