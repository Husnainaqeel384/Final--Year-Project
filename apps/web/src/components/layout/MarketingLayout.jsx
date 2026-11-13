import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LuMenu, LuX } from 'react-icons/lu';
import { buttonClass, IconButton } from '../ui/Button';
import { Brand } from './Brand';

export const GITHUB_URL = 'https://github.com/Husnainaqeel384/Final--Year-Project';

const NAV = [
  { label: 'Features', href: '/#features' },
  { label: 'Integrations', href: '/#integrations' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'About', href: '/about' },
];

function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);

  return (
    <header className="border-line bg-page/90 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Brand />
        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <a key={item.label} href={item.href} className="text-ink-2 hover:text-ink text-sm">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link to="/app" className={buttonClass('primary')}>
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className={buttonClass('ghost')}>
                Sign in
              </Link>
              <Link to="/register" className={buttonClass('primary')}>
                Get started
              </Link>
            </>
          )}
        </div>
        <IconButton label={open ? 'Close menu' : 'Open menu'} className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <LuX className="size-5" /> : <LuMenu className="size-5" />}
        </IconButton>
      </div>
      {open && (
        <nav aria-label="Mobile" className="border-line space-y-1 border-t p-4 md:hidden">
          {NAV.map((item) => (
            <a key={item.label} href={item.href} className="hover:bg-surface-2 block rounded-lg px-3 py-2 text-sm">
              {item.label}
            </a>
          ))}
          <Link to={user ? '/app' : '/login'} className={`${buttonClass('primary')} mt-2 w-full`}>
            {user ? 'Open dashboard' : 'Sign in'}
          </Link>
        </nav>
      )}
    </header>
  );
}

function MarketingFooter() {
  return (
    <footer className="border-line border-t">
      <div className="text-ink-2 mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Budget Book. MIT licensed.</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-5">
          <Link to="/about" className="hover:text-ink">About</Link>
          <Link to="/privacy" className="hover:text-ink">Privacy</Link>
          <Link to="/contact" className="hover:text-ink">Contact</Link>
          <a href={GITHUB_URL} className="hover:text-ink" rel="noreferrer" target="_blank">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}

/** `title` and `description` are hoisted into <head> by React 19 for per-page SEO. */
export function MarketingLayout({ title, description, path, children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${import.meta.env.VITE_SITE_URL}${path}`} />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}

export function ProsePage({ title, description, path, heading, children }) {
  return (
    <MarketingLayout title={title} description={description} path={path}>
      <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
        <div className="text-ink-2 mt-6 space-y-4 leading-7 [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold">
          {children}
        </div>
      </article>
    </MarketingLayout>
  );
}
