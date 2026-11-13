import { LuTriangleAlert } from 'react-icons/lu';
import { Button } from './Button';

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
      <span className="border-line border-t-accent-text size-7 animate-spin rounded-full border-2" />
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`bg-surface-2 animate-pulse rounded-lg ${className}`} />;
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      {Icon && (
        <span className="bg-surface-2 text-ink-2 mb-1 flex size-11 items-center justify-center rounded-full">
          <Icon className="size-5" />
        </span>
      )}
      <p className="font-medium">{title}</p>
      {description && <p className="text-ink-2 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center" role="alert">
      <LuTriangleAlert className="text-critical size-6" />
      <p className="font-medium">We couldn't load this</p>
      <p className="text-ink-2 text-sm">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

const TONES = {
  neutral: 'bg-surface-2 text-ink-2',
  accent: 'bg-accent-soft text-accent-text',
  good: 'bg-good-soft text-good',
  warning: 'bg-warning-soft text-warning',
  critical: 'bg-critical-soft text-critical',
};

export function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}
