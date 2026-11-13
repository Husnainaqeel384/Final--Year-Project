export function Card({ className = '', children }) {
  return (
    <section className={`border-line bg-surface rounded-xl border ${className}`}>{children}</section>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <header className="flex items-start justify-between gap-4 p-5 pb-0">
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {subtitle && <p className="text-ink-3 mt-0.5 text-[13px]">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-ink-2 mt-1 text-sm">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
