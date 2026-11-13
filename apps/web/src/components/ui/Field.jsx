import { useId } from 'react';

const controlClass =
  'border-line bg-surface text-ink placeholder:text-ink-3 w-full rounded-lg border px-3 py-2 text-sm transition-colors outline-none';

function FieldShell({ id, label, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-ink-2 mb-1.5 block text-[13px] font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-ink-3 mt-1 text-xs">{hint}</p>}
    </div>
  );
}

export function Input({ label, hint, ...props }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <input id={id} className={controlClass} {...props} />
    </FieldShell>
  );
}

export function Select({ label, hint, children, ...props }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <select id={id} className={controlClass} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}

export function Textarea({ label, hint, ...props }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint}>
      <textarea id={id} className={`${controlClass} resize-y`} {...props} />
    </FieldShell>
  );
}
