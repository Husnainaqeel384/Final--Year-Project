const VARIANTS = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'border border-line bg-surface text-ink hover:bg-surface-2',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
  danger: 'bg-critical-soft text-critical hover:brightness-95',
};

const SIZES = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
};

export const buttonClass = (variant = 'primary', size = 'md') =>
  `inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]}`;

export function Button({ variant, size, loading, className = '', children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={`${buttonClass(variant, size)} ${className}`}
    >
      {loading && (
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

/** Square icon-only button. `label` is required because the icon alone has no accessible name. */
export function IconButton({ label, className = '', children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={`text-ink-2 hover:bg-surface-2 hover:text-ink inline-flex size-8 items-center justify-center rounded-lg transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
