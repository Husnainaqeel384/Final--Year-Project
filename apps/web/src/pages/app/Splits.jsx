import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LuPlus, LuSplit, LuTrash2, LuUserPlus, LuX } from 'react-icons/lu';
import {
  addContact,
  createGroup,
  deleteContact,
  deleteGroup,
  fetchContacts,
  fetchGroups,
} from '../../api/workspaceApi';
import { getErrorMessage } from '../../api/client';
import { setContacts, setError, setGroups, setLoading } from '../../redux/features/splitSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import { formatMoney } from '../../lib/format';
import { Card, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';

function Splits() {
  const dispatch = useDispatch();
  const { groups, contacts, loading, error } = useSelector((state) => state.split);
  const { currency } = useWorkspace();
  const [username, setUsername] = useState('');
  const [creating, setCreating] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selected, setSelected] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      const [nextGroups, nextContacts] = await Promise.all([fetchGroups(), fetchContacts()]);
      dispatch(setContacts(nextContacts));
      dispatch(setGroups(nextGroups));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const submitContact = async (event) => {
    event.preventDefault();
    try {
      await addContact(username);
      toast.success(`${username} added.`);
      setUsername('');
      dispatch(setContacts(await fetchContacts()));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const removeContact = async (id) => {
    try {
      await deleteContact(id);
      dispatch(setContacts(await fetchContacts()));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const closeCreate = () => {
    setCreating(false);
    setGroupName('');
    setSelected([]);
  };

  const submitGroup = async (event) => {
    event.preventDefault();
    if (selected.length === 0) {
      toast.error('Add at least one member.');
      return;
    }
    try {
      await createGroup({ name: groupName, members: selected });
      toast.success('Group created.');
      closeCreate();
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteGroup(pendingDelete.id);
      toast.success('Group deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPendingDelete(null);
  };

  const available = contacts.filter((contact) => !selected.includes(contact.username));

  return (
    <>
      <title>Split bills — Budget Book</title>
      <PageHeader title="Split bills" subtitle="Share costs and see who still owes what.">
        <Button onClick={() => setCreating(true)}>
          <LuPlus className="size-4" aria-hidden="true" /> New group
        </Button>
      </PageHeader>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {error ? (
            <ErrorState message={error} onRetry={load} />
          ) : loading && groups.length === 0 ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : groups.length === 0 ? (
            <EmptyState icon={LuSplit} title="No groups yet" description="Create a group for roommates, trips or team lunches." />
          ) : (
            <ul className="divide-line divide-y">
              {groups.map((group) => (
                <li key={group.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <Link to={`/app/splits/${group.id}`} className="text-accent-text font-medium">
                      {group.name}
                    </Link>
                    <p className="text-ink-3 text-xs">
                      {group.memberCount} members · Created by {group.creatorName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular text-sm font-medium">{formatMoney(group.myBalance, currency)}</p>
                    <p className="text-ink-3 text-xs">You owe</p>
                  </div>
                  {group.isCreator && (
                    <IconButton label={`Delete ${group.name}`} onClick={() => setPendingDelete(group)}>
                      <LuTrash2 className="size-4" />
                    </IconButton>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Contacts" subtitle="People you split bills with" />
          <form onSubmit={submitContact} className="flex items-end gap-2 p-5 pb-3">
            <div className="flex-1">
              <Input label="Username" required value={username} onChange={(event) => setUsername(event.target.value)} />
            </div>
            <Button type="submit" variant="secondary">
              <LuUserPlus className="size-4" aria-hidden="true" /> Add
            </Button>
          </form>
          <ul className="px-5 pb-4">
            {contacts.map((contact) => (
              <li key={contact.id} className="flex items-center justify-between py-1.5 text-sm">
                {contact.username}
                <IconButton label={`Remove ${contact.username}`} onClick={() => removeContact(contact.id)}>
                  <LuX className="size-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Modal open={creating} title="New group" onClose={closeCreate}>
        <form onSubmit={submitGroup} className="space-y-4">
          <Input label="Group name" required maxLength={50} value={groupName} onChange={(event) => setGroupName(event.target.value)} />
          <Select
            label="Add a member"
            hint={contacts.length === 0 ? 'Add people to your contacts first.' : undefined}
            value=""
            onChange={(event) => event.target.value && setSelected([...selected, event.target.value])}
          >
            <option value="">Choose a contact</option>
            {available.map((contact) => (
              <option key={contact.id} value={contact.username}>
                {contact.username}
              </option>
            ))}
          </Select>
          {selected.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {selected.map((name) => (
                <li key={name} className="bg-surface-2 flex items-center gap-1 rounded-md py-0.5 pr-0.5 pl-2 text-[13px]">
                  {name}
                  <IconButton label={`Remove ${name}`} className="size-6!" onClick={() => setSelected(selected.filter((item) => item !== name))}>
                    <LuX className="size-3" />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={closeCreate}>Cancel</Button>
            <Button type="submit">Create group</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this group?"
        message={`"${pendingDelete?.name}" and its bill history will be removed for every member.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default Splits;
