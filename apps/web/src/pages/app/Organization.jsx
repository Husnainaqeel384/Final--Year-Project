import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { LuBuilding2, LuCopy, LuPlus, LuTrash2, LuUserPlus } from 'react-icons/lu';
import {
  createOrganization,
  deleteOrganization,
  fetchOrganization,
  fetchOrganizations,
  inviteMember,
  removeMember,
  revokeInvitation,
  updateMemberRole,
} from '../../api/workspaceApi';
import { getErrorMessage } from '../../api/client';
import { setDetail, setError, setLoading } from '../../redux/features/organizationSlice';
import { setActiveWorkspace, setOrganizations } from '../../redux/features/workspaceSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import { CURRENCIES, formatDate } from '../../lib/format';
import { Card, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { Badge, EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback';
import { Table, Td } from '../../components/ui/Table';

function CreateOrganizationForm({ onCreated, onClose }) {
  const [form, setForm] = useState({ name: '', currency: 'USD' });

  const submit = async (event) => {
    event.preventDefault();
    try {
      onCreated(await createOrganization(form));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input label="Organization name" required maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      <Select label="Currency" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}>
        {CURRENCIES.map((code) => (
          <option key={code}>{code}</option>
        ))}
      </Select>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
}

function OrganizationDetail({ organizationId }) {
  const dispatch = useDispatch();
  const { detail, loading, error } = useSelector((state) => state.organization);
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const [invite, setInvite] = useState({ email: '', role: 'member' });
  const [inviteUrl, setInviteUrl] = useState(null);
  const [pending, setPending] = useState(null);

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      dispatch(setDetail(await fetchOrganization(organizationId)));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
  }, [dispatch, organizationId]);

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
  if (!detail || detail.id !== organizationId) return <Skeleton className="h-64" />;

  const canManage = ['owner', 'admin'].includes(detail.role);

  const submitInvite = async (event) => {
    event.preventDefault();
    try {
      const result = await inviteMember(detail.id, invite);
      toast.success('Invitation created.');
      setInvite({ email: '', role: 'member' });
      if (result.inviteUrl) setInviteUrl(result.inviteUrl);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const changeRole = async (userId, role) => {
    try {
      await updateMemberRole(detail.id, userId, role);
      toast.success('Role updated.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirm = async () => {
    try {
      if (pending.kind === 'member') await removeMember(detail.id, pending.userId);
      else await revokeInvitation(detail.id, pending.id);
      toast.success('Removed.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPending(null);
  };

  return (
    <div className={`space-y-4 ${loading ? 'opacity-60' : ''}`}>
      <Card>
        <CardHeader title="Members" subtitle={`${detail.members.length} people in ${detail.name}`} />
        <div className="mt-3">
          <Table
            head={[
              { label: 'Name' },
              { label: 'Role' },
              ...(canManage ? [{ label: 'Actions', right: true }] : []),
            ]}
          >
            {detail.members.map((member) => (
              <tr key={member.userId}>
                <Td>
                  <p className="font-medium">{member.firstName} {member.lastName}</p>
                  <p className="text-ink-3 text-xs">{member.email}</p>
                </Td>
                <Td>
                  {canManage && member.role !== 'owner' ? (
                    <select
                      aria-label={`Role for ${member.firstName}`}
                      value={member.role}
                      onChange={(event) => changeRole(member.userId, event.target.value)}
                      className="border-line bg-surface h-8 rounded-md border px-2 text-[13px]"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </select>
                  ) : (
                    <span className="capitalize">
                      <Badge tone={member.role === 'owner' ? 'accent' : 'neutral'}>{member.role}</Badge>
                    </span>
                  )}
                </Td>
                {canManage && (
                  <Td right>
                    {member.role !== 'owner' && member.userId !== currentUserId && (
                      <IconButton
                        label={`Remove ${member.firstName}`}
                        onClick={() => setPending({ kind: 'member', userId: member.userId, label: `${member.firstName} ${member.lastName}` })}
                      >
                        <LuTrash2 className="size-4" />
                      </IconButton>
                    )}
                  </Td>
                )}
              </tr>
            ))}
          </Table>
        </div>
      </Card>

      {canManage && (
        <Card>
          <CardHeader title="Invite someone" subtitle="They'll need an account with this email to join." />
          <form onSubmit={submitInvite} className="grid items-end gap-3 p-5 sm:grid-cols-[1fr_9rem_auto]">
            <Input label="Email" type="email" required value={invite.email} onChange={(event) => setInvite({ ...invite, email: event.target.value })} />
            <Select label="Role" value={invite.role} onChange={(event) => setInvite({ ...invite, role: event.target.value })}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>
            <Button type="submit">
              <LuUserPlus className="size-4" aria-hidden="true" /> Invite
            </Button>
          </form>
          {detail.invitations.length > 0 && (
            <ul className="divide-line border-line divide-y border-t">
              {detail.invitations.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate">{item.email}</span>
                    <span className="text-ink-3 text-xs capitalize">{item.role} · Expires {formatDate(item.expiresAt)}</span>
                  </span>
                  <IconButton label={`Cancel invitation for ${item.email}`} onClick={() => setPending({ kind: 'invitation', id: item.id, label: `the invitation for ${item.email}` })}>
                    <LuTrash2 className="size-4" />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <Modal open={Boolean(inviteUrl)} title="Share this invitation" onClose={() => setInviteUrl(null)}>
        <p className="text-ink-2 text-sm">Email isn't set up on this server, so send this link yourself.</p>
        <code className="bg-surface-2 mt-3 block rounded-lg p-3 text-xs break-all">{inviteUrl}</code>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(inviteUrl);
              toast.success('Copied.');
            }}
          >
            <LuCopy className="size-4" aria-hidden="true" /> Copy
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(pending)}
        title="Are you sure?"
        message={`This will remove ${pending?.label}.`}
        confirmLabel="Remove"
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

function Organization() {
  const dispatch = useDispatch();
  const { organizations } = useSelector((state) => state.workspace);
  const { organization } = useWorkspace();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const refreshList = async () => {
    dispatch(setOrganizations(await fetchOrganizations()));
  };

  const handleCreated = async (created) => {
    setCreating(false);
    await refreshList();
    dispatch(setActiveWorkspace(created.id));
    toast.success('Organization created.');
  };

  const confirmDelete = async () => {
    try {
      await deleteOrganization(organization.id);
      dispatch(setActiveWorkspace(null));
      await refreshList();
      toast.success('Organization deleted.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setDeleting(false);
  };

  return (
    <>
      <title>Organization — Budget Book</title>
      <PageHeader title={organization?.name ?? 'Organizations'} subtitle="Share budgets and expenses with your team.">
        {organization?.role === 'owner' && (
          <Button variant="danger" onClick={() => setDeleting(true)}>
            Delete organization
          </Button>
        )}
        <Button onClick={() => setCreating(true)}>
          <LuPlus className="size-4" aria-hidden="true" /> New organization
        </Button>
      </PageHeader>

      {organization ? (
        <OrganizationDetail organizationId={organization.id} />
      ) : (
        <Card>
          <EmptyState
            icon={LuBuilding2}
            title={organizations.length > 0 ? 'You are in your personal workspace' : 'No organizations yet'}
            description={
              organizations.length > 0
                ? 'Use the workspace menu at the top of the page to open an organization.'
                : 'Create one to share budgets, expenses and transactions with your team.'
            }
          />
        </Card>
      )}

      <Modal open={creating} title="New organization" onClose={() => setCreating(false)}>
        <CreateOrganizationForm onCreated={handleCreated} onClose={() => setCreating(false)} />
      </Modal>

      <ConfirmDialog
        open={deleting}
        title="Delete this organization?"
        message={`All of ${organization?.name}'s budgets, expenses and transactions will be permanently removed.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(false)}
      />
    </>
  );
}

export default Organization;
