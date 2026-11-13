import { Link } from 'react-router-dom';

export function Brand({ to = '/', className = '' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 font-semibold ${className}`}>
      <img src="/favicon.svg" alt="" className="size-7" />
      <span className="tracking-tight">Budget Book</span>
    </Link>
  );
}
