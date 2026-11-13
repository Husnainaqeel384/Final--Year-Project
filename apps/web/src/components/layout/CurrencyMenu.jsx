import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { LuCheck, LuChevronDown } from 'react-icons/lu';
import { updatePreferences } from '../../api/authApi';
import { fetchOrganizations, updateOrganization } from '../../api/workspaceApi';
import { getErrorMessage } from '../../api/client';
import { setUser } from '../../redux/features/authSlice';
import { setOrganizations } from '../../redux/features/workspaceSlice';
import { useDismiss } from '../../hooks/useDismiss';
import { useWorkspace } from '../../hooks/useWorkspace';
import { CURRENCIES, currencyName, currencySymbol } from '../../lib/format';
import { menuClass, menuItemClass } from './menuStyles';

/**
 * Sets the currency of the active workspace: your own in the personal
 * workspace, the team's in an organization. Amounts are relabelled, not
 * converted, because they were entered in that currency to begin with.
 */
function CurrencyMenu() {
  const dispatch = useDispatch();
  const { organization, currency, canManage } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  const choose = async (code) => {
    setOpen(false);
    if (code === currency) return;
    try {
      setSaving(true);
      if (organization) {
        await updateOrganization(organization.id, { name: organization.name, currency: code });
        dispatch(setOrganizations(await fetchOrganizations()));
      } else {
        dispatch(setUser(await updatePreferences({ currency: code })));
      }
      toast.success(`Amounts now show in ${currencyName(code)}.`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Currency: ${currencyName(currency)}`}
        disabled={saving}
        onClick={() => setOpen(!open)}
        className="border-line hover:bg-surface-2 flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-sm disabled:opacity-60"
      >
        <span className="text-ink-3 font-medium">{currencySymbol(currency)}</span>
        <span className="font-medium">{currency}</span>
        <LuChevronDown className="text-ink-3 size-3.5" aria-hidden="true" />
      </button>

      {open && (
        <div className={`${menuClass} right-0 w-72`} role="menu">
          <div className="px-3 pt-2 pb-2">
            <p className="text-sm font-medium">
              {organization ? `${organization.name} currency` : 'Your currency'}
            </p>
            <p className="text-ink-3 mt-0.5 text-xs">
              {canManage
                ? 'Changes the symbol on every amount. Amounts are not converted.'
                : 'Only owners and admins can change the organization currency.'}
            </p>
          </div>
          <div className="border-line border-t pt-1">
            <ul className="max-h-72 overflow-y-auto">
              {CURRENCIES.map((code) => (
                <li key={code}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={code === currency}
                    disabled={!canManage}
                    onClick={() => choose(code)}
                    className={`${menuItemClass} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <span className="w-10 font-medium">{code}</span>
                    <span className="text-ink-2 min-w-0 flex-1 truncate">{currencyName(code)}</span>
                    {code === currency && <LuCheck className="text-accent-text size-4" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencyMenu;
