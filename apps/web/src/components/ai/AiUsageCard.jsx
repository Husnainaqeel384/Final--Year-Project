import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { LuCircleCheck, LuCircleX, LuLoaderCircle } from 'react-icons/lu';
import { fetchAiUsage, saveAiLimits } from '../../api/aiApi';
import { getErrorMessage } from '../../api/client';
import { setUsage } from '../../redux/features/aiSlice';
import { useAi } from '../../hooks/useAi';
import { logger } from '../../lib/logger';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Field';
import { Meter } from '../ui/Meter';
import { Skeleton } from '../ui/Feedback';

const FEATURES = { receipt: 'Receipt scan', insights: 'Monthly summary' };

function timeAgo(minutes) {
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

function WindowStat({ title, window }) {
  const percent = window.limit ? (window.used / window.limit) * 100 : 0;
  return (
    <div className="border-line rounded-lg border p-3">
      <p className="text-ink-3 text-xs">{title}</p>
      <p className="tabular mt-1 text-xl font-semibold tracking-tight">
        {window.used}
        <span className="text-ink-3 text-sm font-normal">{window.limit ? ` of ${window.limit}` : ' · no limit'}</span>
      </p>
      {window.limit ? (
        <div className="mt-2">
          <Meter percent={percent} label={`${title}: ${window.used} of ${window.limit} requests`} />
        </div>
      ) : null}
    </div>
  );
}

// An empty box means no limit.
const toLimit = (value) => (value === '' ? null : Number(value));

/**
 * How many AI requests the person has made, and the daily and weekly caps they
 * chose. Every request sent to a provider counts, so the numbers match what the
 * provider may bill for.
 */
export function AiUsageCard() {
  const dispatch = useDispatch();
  const usage = useSelector((state) => state.ai.usage);
  const { isDemo, providerLabel } = useAi();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchAiUsage();
        dispatch(setUsage(result));
        setForm({ daily: result.limits.daily ?? '', weekly: result.limits.weekly ?? '' });
      } catch (err) {
        // Settings still work without the usage panel.
        logger.warn('Could not load AI usage', getErrorMessage(err));
      }
    };
    load();
  }, [dispatch]);

  const save = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const result = await saveAiLimits({ daily: toLimit(form.daily), weekly: toLimit(form.weekly) });
      dispatch(setUsage(result));
      toast.success('Limits saved.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Usage and limits" subtitle="Every scan or summary sent to your AI provider counts as one request." />
      {!usage || !form ? (
        <div className="space-y-3 p-5">
          <Skeleton className="h-20" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <WindowStat title="Last 24 hours" window={usage.daily} />
            <WindowStat title="Last 7 days" window={usage.weekly} />
            <div className="border-line rounded-lg border p-3">
              <p className="text-ink-3 text-xs">All time</p>
              <p className="tabular mt-1 text-xl font-semibold tracking-tight">{usage.total}</p>
              <p className="text-ink-3 mt-1 text-xs">{usage.failed > 0 ? `${usage.failed} failed` : 'requests'}</p>
            </div>
          </div>

          <form onSubmit={save} className="space-y-3">
            <h3 className="text-sm font-semibold">Your limits</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Daily limit"
                type="number"
                min="1"
                max="1000"
                step="1"
                placeholder="No limit"
                disabled={isDemo}
                value={form.daily}
                onChange={(event) => setForm({ ...form, daily: event.target.value })}
                hint="Requests in any 24 hours"
              />
              <Input
                label="Weekly limit"
                type="number"
                min="1"
                max="10000"
                step="1"
                placeholder="No limit"
                disabled={isDemo}
                value={form.weekly}
                onChange={(event) => setForm({ ...form, weekly: event.target.value })}
                hint="Requests in any 7 days"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-ink-3 text-xs">
                {isDemo ? "Limits can't be changed on the shared demo account." : 'Leave a box empty for no limit. When a limit is reached, AI pauses until older requests fall out of the window.'}
              </p>
              {!isDemo && (
                <Button type="submit" variant="secondary" loading={saving}>
                  Save limits
                </Button>
              )}
            </div>
          </form>

          {usage.recent.length > 0 && (
            <div className="border-line border-t pt-4">
              <h3 className="text-sm font-semibold">Recent requests</h3>
              <ul className="divide-line mt-2 divide-y">
                {usage.recent.map((row) => {
                  const Icon = row.ok === null ? LuLoaderCircle : row.ok ? LuCircleCheck : LuCircleX;
                  const tone = row.ok === null ? 'text-ink-3' : row.ok ? 'text-good' : 'text-critical';
                  return (
                    <li key={row.id} className="flex items-center gap-3 py-2 text-sm">
                      <Icon className={`size-4 shrink-0 ${tone}`} aria-label={row.ok === null ? 'In progress' : row.ok ? 'Answered' : 'Failed'} />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium">{FEATURES[row.feature] ?? row.feature}</span>
                        <span className="text-ink-3 block truncate text-xs">
                          {providerLabel(row.provider)} · {row.model}
                        </span>
                      </span>
                      <span className="text-ink-3 shrink-0 text-xs">{timeAgo(row.minutesAgo)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
