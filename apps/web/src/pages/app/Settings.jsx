import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LuChartColumn, LuExternalLink, LuKeyRound, LuReceipt, LuSparkles } from 'react-icons/lu';
import { deleteAiSettings, listAiModels, saveAiSettings } from '../../api/aiApi';
import { getErrorMessage } from '../../api/client';
import { setSaved, setSession } from '../../redux/features/aiSlice';
import { useAi } from '../../hooks/useAi';
import { aiSessionSummary, clearAiSession, saveAiSession } from '../../lib/aiSession';
import { Card, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { Segmented } from '../../components/ui/Segmented';
import { InfoNote, Skeleton } from '../../components/ui/Feedback';
import { AiUsageCard } from '../../components/ai/AiUsageCard';

const SHORT_NAMES = { claude: 'Claude', openai: 'ChatGPT', gemini: 'Gemini', deepseek: 'DeepSeek' };

function Connected({ active, providerLabel, isDemo, onRemove, removing }) {
  return (
    <div className="border-line bg-surface-2/50 flex flex-wrap items-center gap-3 rounded-lg border p-3">
      <span className="bg-good-soft text-good flex size-9 shrink-0 items-center justify-center rounded-full">
        <LuKeyRound className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {providerLabel(active.provider)} {isDemo ? 'is ready for this visit' : 'is connected'}
        </p>
        <p className="text-ink-3 text-xs wrap-anywhere">
          {active.model} · key ending {active.keyHint}
        </p>
      </div>
      <Button variant="danger" size="sm" loading={removing} onClick={onRemove}>
        {isDemo ? 'Forget key' : 'Remove'}
      </Button>
    </div>
  );
}

function AiSettingsCard() {
  const dispatch = useDispatch();
  const { providers, active, loaded, isDemo, providerLabel } = useAi();
  const [provider, setProvider] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState(null);
  const [model, setModel] = useState('');
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  if (!loaded) {
    return (
      <div className="space-y-3 p-5">
        <Skeleton className="h-14" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  // A connected key fixes the provider: switching means removing the key first.
  const chosen = active ? active.provider : (provider ?? 'claude');
  const details = providers.find((entry) => entry.id === chosen);
  // A saved key can be reused to change only the model; a demo visitor's key is never on the server.
  const canReuseKey = !isDemo && active?.provider === chosen;

  const changeProvider = (next) => {
    setProvider(next);
    setModels(null);
    setModel('');
  };

  const check = async () => {
    if (!apiKey && !canReuseKey) {
      toast.error('Paste your API key first.');
      return;
    }
    try {
      setChecking(true);
      const result = await listAiModels({ provider: chosen, apiKey });
      if (result.models.length === 0) {
        toast.error('That key works, but it has no models available.');
        return;
      }
      setModels(result.models);
      setModel(active?.provider === chosen && result.models.some((entry) => entry.id === active.model) ? active.model : result.suggested);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      if (isDemo) {
        saveAiSession({ provider: chosen, model, apiKey });
        dispatch(setSession(aiSessionSummary()));
        toast.success('Your key is ready for this visit.');
      } else {
        dispatch(setSaved(await saveAiSettings({ provider: chosen, model, apiKey })));
        toast.success('AI is connected.');
      }
      setApiKey('');
      setModels(null);
      setProvider(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      setRemoving(true);
      if (isDemo) {
        clearAiSession();
        dispatch(setSession(null));
      } else {
        await deleteAiSettings();
        dispatch(setSaved(null));
      }
      toast.success('The key was removed.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-5 p-5">
      {active ? (
        <Connected active={active} providerLabel={providerLabel} isDemo={isDemo} onRemove={remove} removing={removing} />
      ) : (
        <InfoNote>
          {isDemo
            ? 'This is a shared demo account, so nothing is saved here. Add your own key to try AI during this visit.'
            : 'AI is off until you add an API key from one of the providers below.'}
        </InfoNote>
      )}

      <form onSubmit={save} className="space-y-4">
        <h3 className="text-sm font-semibold">{active ? 'Change key or model' : 'Connect a provider'}</h3>
        {active ? (
          <p className="text-ink-2 text-sm">
            Provider: <span className="text-ink font-medium">{providerLabel(active.provider)}</span>
            <span className="text-ink-3 mt-0.5 block text-xs">
              To use a different provider, {isDemo ? 'forget' : 'remove'} this key first.
            </span>
          </p>
        ) : (
          <Segmented
            legend="Provider"
            name="provider"
            value={chosen}
            onChange={changeProvider}
            options={providers.map((entry) => ({ value: entry.id, label: SHORT_NAMES[entry.id] ?? entry.label }))}
          />
        )}
        <div>
          <Input
            label="API key"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder={canReuseKey ? `Leave empty to keep the key ending ${active.keyHint}` : 'Paste your key'}
            value={apiKey}
            onChange={(event) => {
              setApiKey(event.target.value.trim());
              setModels(null);
            }}
          />
          {details?.keysUrl && (
            <a href={details.keysUrl} target="_blank" rel="noreferrer" className="text-accent-text mt-1.5 inline-flex items-center gap-1 text-xs font-medium">
              Get a key from {details.label} <LuExternalLink className="size-3" aria-hidden="true" />
            </a>
          )}
        </div>

        {models ? (
          <Select label="Model" value={model} onChange={(event) => setModel(event.target.value)} hint="To scan receipts, the model must read images. Newer models can be slow: if answers take too long, pick a lighter one (a “flash”, “lite” or “mini” model).">
            {models.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.label === entry.id ? entry.id : `${entry.label} (${entry.id})`}
              </option>
            ))}
          </Select>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant={models ? 'secondary' : 'primary'} loading={checking} onClick={check}>
            Check key
          </Button>
          {models && (
            <Button type="submit" loading={saving} disabled={!model}>
              {isDemo ? 'Use for this visit' : 'Save'}
            </Button>
          )}
        </div>
      </form>

      <ul className="text-ink-3 border-line space-y-1.5 border-t pt-4 text-xs">
        <li>
          {isDemo
            ? 'Your key stays in this browser tab only. It is never saved, and it is gone when you close the tab.'
            : 'Your key is encrypted before it is stored and is never shown again, only its last four characters.'}
        </li>
        <li>Requests are billed to your own provider account. A receipt scan or a monthly summary usually costs a few cents or less.</li>
        <li>Receipt photos are sent to the provider to be read. Budget Book does not keep them.</li>
      </ul>
    </div>
  );
}

function Settings() {
  return (
    <>
      <title>Settings — Budget Book</title>
      <PageHeader title="Settings" subtitle="Connect the AI that powers receipt scanning and monthly summaries." />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="AI assistant" subtitle="Use your own Claude, ChatGPT, Gemini or DeepSeek account." />
            <AiSettingsCard />
          </Card>
          <AiUsageCard />
        </div>

        <Card>
          <CardHeader title="What AI does here" />
          <ul className="space-y-4 p-5 text-sm">
            <li className="flex gap-3">
              <LuReceipt className="text-accent-text mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">Scan a receipt</p>
                <p className="text-ink-2 mt-0.5">
                  On{' '}
                  <Link to="/app/expenses" className="text-accent-text font-medium">
                    Expenses
                  </Link>
                  , upload a photo and the expense form fills itself in. You check it and save.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <LuChartColumn className="text-accent-text mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium">Explain a month</p>
                <p className="text-ink-2 mt-0.5">
                  On{' '}
                  <Link to="/app/reports" className="text-accent-text font-medium">
                    Reports
                  </Link>
                  , get a short summary of where the money went and what to watch.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <LuSparkles className="text-accent-text mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p className="text-ink-2">The AI never saves or changes anything on its own. Every number in a summary comes from your own records.</p>
            </li>
          </ul>
        </Card>
      </div>
    </>
  );
}

export default Settings;
