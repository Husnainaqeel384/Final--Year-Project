import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { LuBell, LuCheck, LuCircleCheck } from 'react-icons/lu';
import { fetchReminderAlerts } from '../../api/workspaceApi';
import { getErrorMessage } from '../../api/client';
import { setAlerts, setError, setLoading } from '../../redux/features/notificationSlice';
import { logger } from '../../lib/logger';
import { useDismiss } from '../../hooks/useDismiss';
import { useWorkspace } from '../../hooks/useWorkspace';
import { daysUntil, describeDue, formatMoney, today } from '../../lib/format';
import MarkPaidDialog from '../reminders/MarkPaidDialog';
import { menuClass } from './menuStyles';

function dueTone(dueDate) {
  const days = daysUntil(dueDate);
  if (days < 0) return 'text-critical';
  if (days <= 1) return 'text-warning';
  return 'text-ink-3';
}

function AlertItem({ item, currency, onPay }) {
  const overdue = daysUntil(item.dueDate) < 0;
  return (
    <li className="hover:bg-surface-2 flex items-center gap-3 rounded-lg px-3 py-2.5">
      <span
        className={`size-2 shrink-0 rounded-full ${overdue ? 'bg-critical' : 'bg-warning'}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="text-xs">
          <span className={dueTone(item.dueDate)}>{describeDue(item.dueDate)}</span>
          {item.amount ? <span className="text-ink-3 tabular"> · {formatMoney(item.amount, currency)}</span> : null}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onPay(item)}
        aria-label={`Mark ${item.title} as done`}
        className="border-line bg-surface hover:bg-surface-2 text-ink flex h-7 shrink-0 items-center gap-1 rounded-md border px-2 text-xs font-medium"
      >
        <LuCheck className="size-3.5" aria-hidden="true" />
        {item.amount ? 'Pay' : 'Done'}
      </button>
    </li>
  );
}

/**
 * The bell in the top bar. It lists reminders that are overdue or due soon and
 * clears itself when they are paid; there is no read/unread state to keep.
 */
function NotificationMenu() {
  const dispatch = useDispatch();
  const { items, total, overdue, windowDays, version } = useSelector((state) => state.notification);
  const { activeId, currency } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState(null);
  const ref = useDismiss(open, () => setOpen(false));

  const load = useCallback(async () => {
    try {
      dispatch(setLoading());
      // The browser's date decides what counts as overdue, as on the Reminders page.
      dispatch(setAlerts(await fetchReminderAlerts({ today: today() })));
    } catch (err) {
      // The bell is secondary: a failure here should never interrupt the page.
      dispatch(setError(getErrorMessage(err)));
      logger.warn('Could not load reminder alerts', getErrorMessage(err));
    }
    // activeId and version: a workspace switch or a changed reminder refetches.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activeId, version]);

  useEffect(() => {
    load();
  }, [load]);

  // A tab left open overnight should not keep yesterday's alerts.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const pay = (item) => {
    setOpen(false);
    setPaying(item);
  };

  const label = total === 0 ? 'Notifications: nothing needs attention' : `Notifications: ${total} ${total === 1 ? 'reminder needs' : 'reminders need'} attention`;

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="text-ink-2 hover:bg-surface-2 hover:text-ink relative flex size-9 items-center justify-center rounded-lg"
        >
          <LuBell className="size-[18px]" aria-hidden="true" />
          {total > 0 && (
            <span
              className={`ring-page tabular absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold text-page ring-2 ${
                overdue.count > 0 ? 'bg-critical' : 'bg-warning'
              }`}
              aria-hidden="true"
            >
              {total > 9 ? '9+' : total}
            </span>
          )}
        </button>

        {open && (
          <div className={`${menuClass} right-0 w-[22rem] max-sm:fixed max-sm:inset-x-4 max-sm:top-14 max-sm:w-auto`} role="menu">
            <div className="px-3 pt-2 pb-2">
              <p className="text-sm font-semibold">Reminders</p>
              <p className="text-ink-3 mt-0.5 text-xs">Overdue or due in the next {windowDays} days</p>
            </div>
            <div className="border-line border-t pt-1">
              {items.length === 0 ? (
                <div className="flex flex-col items-center px-3 py-6 text-center">
                  <LuCircleCheck className="text-good size-6" aria-hidden="true" />
                  <p className="mt-2 text-sm font-medium">You're all caught up</p>
                  <p className="text-ink-3 mt-0.5 text-xs">Nothing is due in the next {windowDays} days.</p>
                </div>
              ) : (
                <ul className="max-h-80 overflow-y-auto">
                  {items.map((item) => (
                    <AlertItem key={item.id} item={item} currency={currency} onPay={pay} />
                  ))}
                </ul>
              )}
            </div>
            <div className="border-line mt-1 flex items-center justify-between border-t px-3 pt-2 pb-1">
              <span className="text-ink-3 text-xs">{total > items.length ? `${total - items.length} more` : ''}</span>
              <Link to="/app/reminders" onClick={() => setOpen(false)} className="text-accent-text text-sm font-medium">
                View all reminders
              </Link>
            </div>
          </div>
        )}
      </div>

      <MarkPaidDialog reminder={paying} onClose={() => setPaying(null)} />
    </>
  );
}

export default NotificationMenu;
