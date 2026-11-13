import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LuInfo } from 'react-icons/lu';
import { logout } from '../../api/authApi';
import { clearUser } from '../../redux/features/authSlice';

/** Tells a demo visitor that the account is shared and gives them a way to make their own. */
function DemoBanner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDemo = useSelector((state) => state.auth.user?.isDemo);

  if (!isDemo) return null;

  // The sign-up page is for signed-out visitors, so the demo session ends first.
  const createAccount = async () => {
    await logout().catch(() => {});
    dispatch(clearUser());
    navigate('/register');
  };

  return (
    <div className="bg-accent-soft/60 text-ink-2 mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-3 py-2 text-[13px] sm:mb-6">
      <LuInfo className="text-accent-text size-4 shrink-0" aria-hidden="true" />
      <p className="min-w-48 flex-1">
        You're exploring a shared demo. Try anything: it all resets every night.
      </p>
      <button type="button" onClick={createAccount} className="text-accent-text font-medium max-sm:ml-7">
        Create your own account
      </button>
    </div>
  );
}

export default DemoBanner;
