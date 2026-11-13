import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { LuBuilding2, LuCheck, LuChevronsUpDown, LuLogOut, LuMenu, LuMoon, LuSun, LuUser } from 'react-icons/lu';
import { logout } from '../../api/authApi';
import { clearUser } from '../../redux/features/authSlice';
import { setActiveWorkspace } from '../../redux/features/workspaceSlice';
import { setSidebarOpen, toggleTheme } from '../../redux/features/uiSlice';
import { useDismiss } from '../../hooks/useDismiss';
import { IconButton } from '../ui/Button';
import CurrencyMenu from './CurrencyMenu';
import { menuClass, menuItemClass } from './menuStyles';


export function Avatar({ user, className = 'size-8 text-xs' }) {
  if (user?.avatarUrl) {
    return <img src={user.avatarUrl} alt="" className={`rounded-full object-cover ${className}`} />;
  }
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();
  return (
    <span className={`bg-accent-soft text-accent-text flex items-center justify-center rounded-full font-semibold ${className}`}>
      {initials}
    </span>
  );
}

function WorkspaceOption({ name, detail, selected, onSelect }) {
  return (
    <button type="button" className={menuItemClass} onClick={onSelect}>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{name}</span>
        <span className="text-ink-3 block text-xs capitalize">{detail}</span>
      </span>
      {selected && <LuCheck className="text-accent-text size-4" aria-hidden="true" />}
    </button>
  );
}

function WorkspaceSwitcher() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { organizations, activeId } = useSelector((state) => state.workspace);
  const ref = useDismiss(open, () => setOpen(false));
  const active = organizations.find((org) => org.id === activeId);

  const choose = (id) => {
    dispatch(setActiveWorkspace(id));
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="border-line hover:bg-surface-2 flex h-9 max-w-52 items-center gap-2 rounded-lg border px-3 text-sm"
      >
        <LuBuilding2 className="text-ink-3 size-4 shrink-0" aria-hidden="true" />
        <span className="truncate font-medium">{active?.name ?? 'Personal'}</span>
        <LuChevronsUpDown className="text-ink-3 size-3.5 shrink-0" aria-hidden="true" />
      </button>
      {open && (
        <div className={`${menuClass} left-0 w-64`}>
          <WorkspaceOption name="Personal" detail="Only you" selected={!activeId} onSelect={() => choose(null)} />
          {organizations.map((org) => (
            <WorkspaceOption
              key={org.id}
              name={org.name}
              detail={org.role}
              selected={activeId === org.id}
              onSelect={() => choose(org.id)}
            />
          ))}
          <div className="border-line my-1 border-t" />
          <Link
            to="/app/organization"
            onClick={() => setOpen(false)}
            className={`${menuItemClass} text-accent-text`}
          >
            Manage organizations
          </Link>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const ref = useDismiss(open, () => setOpen(false));

  const signOut = async () => {
    // The local session must end even if the network call fails.
    await logout().catch(() => {});
    dispatch(clearUser());
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center rounded-full"
      >
        <Avatar user={user} />
      </button>
      {open && (
        <div className={`${menuClass} right-0 w-56`}>
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-ink-3 truncate text-xs">{user?.email}</p>
          </div>
          <div className="border-line my-1 border-t" />
          <Link to="/app/profile" onClick={() => setOpen(false)} className={menuItemClass}>
            <LuUser className="size-4" aria-hidden="true" /> Profile
          </Link>
          <button type="button" onClick={signOut} className={menuItemClass}>
            <LuLogOut className="size-4" aria-hidden="true" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function Topbar() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);

  return (
    <header className="border-line bg-page/90 sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <IconButton label="Open menu" className="lg:hidden" onClick={() => dispatch(setSidebarOpen(true))}>
          <LuMenu className="size-5" />
        </IconButton>
        <WorkspaceSwitcher />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <CurrencyMenu />
        <IconButton
          label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === 'dark' ? <LuSun className="size-4" /> : <LuMoon className="size-4" />}
        </IconButton>
        <UserMenu />
      </div>
    </header>
  );
}

export default Topbar;
