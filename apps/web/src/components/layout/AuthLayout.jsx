import { Brand } from './Brand';

export function AuthLayout({ title, subtitle, pageTitle, children, footer }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <title>{`${pageTitle ?? title} — Budget Book`}</title>
      <Brand className="mb-6" />
      <div className="border-line bg-surface w-full max-w-sm rounded-xl border p-6">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-ink-2 mt-1 text-sm">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
      {footer && <p className="text-ink-2 mt-5 text-sm">{footer}</p>}
    </main>
  );
}
