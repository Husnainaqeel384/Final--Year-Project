import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { LuCheck, LuCopy, LuSparkles } from 'react-icons/lu';
import { DEMO_ACCOUNT } from '../../config/features';
import { Button } from '../ui/Button';
import { DemoButton } from './DemoButton';

function Credential({ label, value }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Browsers only allow the clipboard on HTTPS or localhost.
      toast.error('Could not copy. Please select the text instead.');
    }
  };

  return (
    <div className="flex items-center gap-3">
      <dt className="text-ink-3 w-16 shrink-0">{label}</dt>
      <dd className="min-w-0 flex-1 truncate font-medium select-all">{value}</dd>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
        className="text-ink-3 hover:bg-surface hover:text-ink flex size-7 shrink-0 items-center justify-center rounded-md"
      >
        {copied ? <LuCheck className="text-good size-4" aria-hidden="true" /> : <LuCopy className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
}

/** Lets a visitor see the app without signing up: sign in at once, or fill the form to see how it works. */
export function DemoAccountBox({ onFill }) {
  return (
    <section aria-label="Demo account" className="border-accent-soft bg-accent-soft/40 rounded-xl border p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <LuSparkles className="text-accent-text size-4" aria-hidden="true" />
        Just looking? Use the demo account
      </p>
      <dl className="mt-3 space-y-1 text-sm">
        <Credential label="Email" value={DEMO_ACCOUNT.email} />
        <Credential label="Password" value={DEMO_ACCOUNT.password} />
      </dl>
      <div className="mt-3 flex gap-2">
        <DemoButton size="sm" className="flex-1">
          Sign in to the demo
        </DemoButton>
        <Button variant="secondary" size="sm" onClick={onFill}>
          Fill in the form
        </Button>
      </div>
    </section>
  );
}
