import { Link } from 'react-router-dom';
import { buttonClass } from '../../components/ui/Button';

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <title>Page not found — Budget Book</title>
      <meta name="robots" content="noindex" />
      <p className="text-ink-3 text-sm font-medium">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">We can't find that page</h1>
      <Link to="/" className={`${buttonClass('primary')} mt-3`}>
        Back to home
      </Link>
    </main>
  );
}

export default NotFound;
