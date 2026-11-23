import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { LuCircleCheck, LuInfo, LuRefreshCw, LuSparkles, LuTriangleAlert } from 'react-icons/lu';
import { fetchInsights, generateInsights } from '../../api/aiApi';
import { getErrorMessage } from '../../api/client';
import { useAi } from '../../hooks/useAi';
import { useWorkspace } from '../../hooks/useWorkspace';
import { logger } from '../../lib/logger';
import { formatDate, formatMonth } from '../../lib/format';
import { Button } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';
import { Skeleton } from '../ui/Feedback';
import { AiSetupPrompt } from './AiSetupPrompt';

const TONES = {
  good: { icon: LuCircleCheck, className: 'text-good' },
  warning: { icon: LuTriangleAlert, className: 'text-warning' },
  neutral: { icon: LuInfo, className: 'text-ink-3' },
};

/**
 * A plain-language summary of a report month. The saved one is shown for free;
 * a new one is only written when the person asks, because it uses their AI credit.
 */
export function MonthInsights({ month }) {
  const { ready, isDemo, providerLabel } = useAi();
  const { activeId } = useWorkspace();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    let current = true;
    const load = async () => {
      try {
        setLoading(true);
        const saved = await fetchInsights(month);
        if (current) setInsight(saved);
      } catch (err) {
        // The report is still useful without the summary.
        logger.warn('Could not load the saved summary', getErrorMessage(err));
        if (current) setInsight(null);
      } finally {
        if (current) setLoading(false);
      }
    };
    load();
    // A quick switch between months must not show the previous month's answer.
    return () => {
      current = false;
    };
  }, [month, activeId]);

  const write = async () => {
    if (!ready) {
      setNeedsSetup(true);
      return;
    }
    try {
      setWriting(true);
      setInsight(await generateInsights(month));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setWriting(false);
    }
  };

  const action = (
    <Button variant="secondary" size="sm" loading={writing} onClick={write}>
      {!writing && (insight ? <LuRefreshCw className="size-3.5" aria-hidden="true" /> : <LuSparkles className="size-3.5" aria-hidden="true" />)}
      {writing ? 'Writing…' : insight ? 'Refresh' : 'Explain this month'}
    </Button>
  );

  let body;
  if (loading) {
    body = (
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  } else if (!insight) {
    body = (
      <p className="text-ink-2 text-sm">
        Get a short summary of {formatMonth(month)}: where the money went, what went well and what to watch next.
      </p>
    );
  } else {
    body = (
      <>
        <p className="text-[15px] font-medium text-pretty">{insight.summary}</p>
        <ul className="mt-3 space-y-2">
          {insight.points.map((point) => {
            const tone = TONES[point.tone] ?? TONES.neutral;
            return (
              <li key={point.text} className="flex gap-2.5 text-sm">
                <tone.icon className={`mt-0.5 size-4 shrink-0 ${tone.className}`} aria-hidden="true" />
                <span className="text-ink-2">{point.text}</span>
              </li>
            );
          })}
        </ul>
        <p className="text-ink-3 mt-4 text-xs">
          Written by {providerLabel(insight.provider)} using {insight.model} on {formatDate(insight.createdAt)}. The figures come from your own records.
        </p>
      </>
    );
  }

  return (
    <Card>
      <CardHeader title="AI summary" subtitle="A plain-language read of this month" action={action} />
      <div className={`p-5 transition-opacity ${writing ? 'opacity-60' : ''}`}>{body}</div>
      <AiSetupPrompt open={needsSetup} feature="The monthly summary" isDemo={isDemo} onClose={() => setNeedsSetup(false)} />
    </Card>
  );
}
