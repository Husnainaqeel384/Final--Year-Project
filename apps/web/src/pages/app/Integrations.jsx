import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  LuCalendar,
  LuCopy,
  LuDownload,
  LuFileSpreadsheet,
  LuSheet,
  LuTrash2,
  LuUpload,
  LuWebhook,
} from 'react-icons/lu';
import {
  createFeed,
  createWebhook,
  deleteFeed,
  deleteWebhook,
  fetchFeeds,
  fetchWebhooks,
  importSpreadsheet,
  testWebhook,
} from '../../api/workspaceApi';
import { downloadFile, getErrorMessage } from '../../api/client';
import { setError, setFeeds, setLoading, setWebhooks } from '../../redux/features/integrationSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import { Card, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button, IconButton } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { Badge, ErrorState } from '../../components/ui/Feedback';

const EVENTS = [
  { value: 'expense.created', label: 'New expense' },
  { value: 'transaction.created', label: 'New transaction' },
  { value: 'budget.threshold', label: 'Category reaches 80% or 100%' },
];

const FEEDS = [
  {
    kind: 'calendar',
    icon: LuCalendar,
    title: 'Calendar feed',
    description: 'Subscribe from Google Calendar, Outlook or Apple Calendar to see your reminders.',
    usage: (url) => `Add this as a calendar "from URL": ${url}`,
  },
  {
    kind: 'sheets',
    icon: LuSheet,
    title: 'Google Sheets',
    description: 'Keep a spreadsheet up to date with your latest transactions.',
    usage: (url) => `=IMPORTDATA("${url}")`,
  },
];

function SpreadsheetCard({ dataset, title }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const notifyFailure = (err) => toast.error(getErrorMessage(err));

  const upload = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      setBusy(true);
      setResult(await importSpreadsheet(dataset, file));
    } catch (err) {
      notifyFailure(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-line rounded-lg border p-4">
      <p className="font-medium">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input ref={input} type="file" accept=".xlsx,.csv" className="hidden" aria-label={`Import ${title}`} onChange={upload} />
        <Button variant="secondary" size="sm" loading={busy} onClick={() => input.current.click()}>
          <LuUpload className="size-3.5" aria-hidden="true" /> Import
        </Button>
        <Button variant="secondary" size="sm" onClick={() => downloadFile(`/integrations/export/${dataset}.xlsx`, `${dataset}.xlsx`).catch(notifyFailure)}>
          <LuDownload className="size-3.5" aria-hidden="true" /> Excel
        </Button>
        <Button variant="secondary" size="sm" onClick={() => downloadFile(`/integrations/export/${dataset}.csv`, `${dataset}.csv`).catch(notifyFailure)}>
          <LuDownload className="size-3.5" aria-hidden="true" /> CSV
        </Button>
        <Button variant="ghost" size="sm" onClick={() => downloadFile(`/integrations/templates/${dataset}.xlsx`, `${dataset}-template.xlsx`).catch(notifyFailure)}>
          Get template
        </Button>
      </div>
      {result && (
        <div className="mt-3 text-[13px]">
          <p>
            Imported {result.imported} of {result.total} rows.
          </p>
          {result.errors.length > 0 && (
            <ul className="text-critical mt-1 list-inside list-disc">
              {result.errors.slice(0, 5).map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Integrations() {
  const dispatch = useDispatch();
  const { feeds, webhooks, error } = useSelector((state) => state.integration);
  const { activeId, canManage } = useWorkspace();
  const [revealed, setRevealed] = useState(null);
  const [form, setForm] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      const [nextFeeds, nextWebhooks] = await Promise.all([fetchFeeds(), fetchWebhooks()]);
      dispatch(setFeeds(nextFeeds));
      dispatch(setWebhooks(nextWebhooks));
    } catch (err) {
      dispatch(setError(getErrorMessage(err)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activeId]);

  useEffect(() => {
    load();
  }, [load]);

  const generateFeed = async (feed) => {
    try {
      const created = await createFeed(feed.kind);
      setRevealed({ ...feed, url: created.url });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const removeFeed = async (id) => {
    try {
      await deleteFeed(id);
      toast.success('Link turned off.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success('Copied.');
  };

  const submitWebhook = async (event) => {
    event.preventDefault();
    try {
      await createWebhook(form);
      toast.success('Webhook added.');
      setForm(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const sendTest = async (id) => {
    try {
      const result = await testWebhook(id);
      if (result.ok) toast.success('Test message delivered.');
      else toast.error(`Delivery failed: ${result.detail}`);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteWebhook(pendingDelete.id);
      toast.success('Webhook removed.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
    setPendingDelete(null);
  };

  const toggleEvent = (value) => {
    const events = form.events.includes(value)
      ? form.events.filter((item) => item !== value)
      : [...form.events, value];
    setForm({ ...form, events });
  };

  if (error) {
    return (
      <Card>
        <ErrorState message={error} onRetry={load} />
      </Card>
    );
  }

  return (
    <>
      <title>Integrations — Budget Book</title>
      <PageHeader title="Integrations" subtitle="Move data in and out, and connect the tools you already use." />

      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Excel and CSV"
            subtitle="Import up to 5,000 rows at a time. Download the template to see the expected columns."
            action={<LuFileSpreadsheet className="text-ink-3 size-5" aria-hidden="true" />}
          />
          <div className="grid gap-3 p-5 md:grid-cols-2">
            <SpreadsheetCard dataset="transactions" title="Transactions" />
            <SpreadsheetCard dataset="expenses" title="Expenses" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Live feeds" subtitle="Private links other apps can read. Anyone with a link can see that data." />
          <ul className="divide-line mt-3 divide-y">
            {FEEDS.map((feed) => {
              const existing = feeds.find((item) => item.kind === feed.kind);
              return (
                <li key={feed.kind} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <feed.icon className="text-ink-2 size-5 shrink-0" aria-hidden="true" />
                  <div className="min-w-52 flex-1">
                    <p className="font-medium">{feed.title}</p>
                    <p className="text-ink-2 text-[13px]">{feed.description}</p>
                  </div>
                  {existing && <Badge tone="good">Active</Badge>}
                  <Button variant="secondary" size="sm" onClick={() => generateFeed(feed)}>
                    {existing ? 'Replace link' : 'Create link'}
                  </Button>
                  {existing && (
                    <IconButton label={`Turn off ${feed.title}`} onClick={() => removeFeed(existing.id)}>
                      <LuTrash2 className="size-4" />
                    </IconButton>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Slack, Discord and webhooks"
            subtitle="Send events to a channel, or to Zapier and Make."
            action={
              canManage && (
                <Button size="sm" onClick={() => setForm({ name: '', provider: 'slack', url: '', events: ['budget.threshold'] })}>
                  Add webhook
                </Button>
              )
            }
          />
          {webhooks.length === 0 ? (
            <p className="text-ink-2 p-5 text-sm">No webhooks connected.</p>
          ) : (
            <ul className="divide-line mt-3 divide-y">
              {webhooks.map((hook) => (
                <li key={hook.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <LuWebhook className="text-ink-2 size-5 shrink-0" aria-hidden="true" />
                  <div className="min-w-48 flex-1">
                    <p className="font-medium">{hook.name}</p>
                    <p className="text-ink-3 truncate text-xs">{hook.host} · {hook.events.length} events</p>
                  </div>
                  {hook.lastStatus !== null && (
                    <Badge tone={hook.lastStatus >= 200 && hook.lastStatus < 300 ? 'good' : 'critical'}>
                      {hook.lastStatus === 0 ? 'Unreachable' : `Last: ${hook.lastStatus}`}
                    </Badge>
                  )}
                  {canManage && (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => sendTest(hook.id)}>Send test</Button>
                      <IconButton label={`Remove ${hook.name}`} onClick={() => setPendingDelete(hook)}>
                        <LuTrash2 className="size-4" />
                      </IconButton>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal open={Boolean(revealed)} title={`Your ${revealed?.title ?? ''} link`} onClose={() => setRevealed(null)}>
        {revealed && (
          <>
            <p className="text-ink-2 text-sm">Copy this now. For your security it won't be shown again.</p>
            <code className="bg-surface-2 mt-3 block rounded-lg p-3 text-xs break-all">
              {revealed.usage(revealed.url)}
            </code>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => copy(revealed.usage(revealed.url))}>
                <LuCopy className="size-4" aria-hidden="true" /> Copy
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={Boolean(form)} title="Add webhook" onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={submitWebhook} className="space-y-4">
            <Input label="Name" required maxLength={60} placeholder="Finance channel" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Select label="Destination" value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })}>
              <option value="slack">Slack</option>
              <option value="discord">Discord</option>
              <option value="generic">Other (Zapier, Make, custom)</option>
            </Select>
            <Input label="Webhook URL" type="url" required pattern="https://.*" hint="Must start with https://" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} />
            <fieldset>
              <legend className="text-ink-2 mb-1.5 text-[13px] font-medium">Send these events</legend>
              <div className="space-y-1.5">
                {EVENTS.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.events.includes(item.value)} onChange={() => toggleEvent(item.value)} />
                    {item.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button>
              <Button type="submit" disabled={form.events.length === 0}>Add webhook</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove this webhook?"
        message={`"${pendingDelete?.name}" will stop receiving events.`}
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

export default Integrations;
