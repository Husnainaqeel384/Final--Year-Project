import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LuArrowLeftRight,
  LuBell,
  LuBuilding2,
  LuChartColumn,
  LuLayoutDashboard,
  LuPlug,
  LuReceipt,
  LuSplit,
  LuStickyNote,
  LuTags,
  LuUsers,
  LuWallet,
} from 'react-icons/lu';
import { setSidebarOpen } from '../../redux/features/uiSlice';
import { FEATURES } from '../../config/features';
import { Brand } from './Brand';

const SECTIONS = [
  {
    title: 'Overview',
    links: [
      { label: 'Dashboard', to: '/app', icon: LuLayoutDashboard, end: true },
      { label: 'Reports', to: '/app/reports', icon: LuChartColumn },
    ],
  },
  {
    title: 'Money',
    links: [
      { label: 'Budgets', to: '/app/budgets', icon: LuWallet },
      { label: 'Expenses', to: '/app/expenses', icon: LuReceipt },
      { label: 'Transactions', to: '/app/transactions', icon: LuArrowLeftRight },
      ...(FEATURES.splitBills ? [{ label: 'Split bills', to: '/app/splits', icon: LuSplit }] : []),
    ],
  },
  {
    title: 'Planning',
    links: [
      { label: 'Reminders', to: '/app/reminders', icon: LuBell },
      { label: 'Notes', to: '/app/notes', icon: LuStickyNote },
    ],
  },
  {
    title: 'Workspace',
    links: [
      { label: 'Organization', to: '/app/organization', icon: LuBuilding2 },
      { label: 'Integrations', to: '/app/integrations', icon: LuPlug },
    ],
  },
];

const ADMIN_SECTION = {
  title: 'Administration',
  links: [
    { label: 'Users', to: '/app/admin/users', icon: LuUsers },
    { label: 'Categories', to: '/app/admin/categories', icon: LuTags },
  ],
};

function Sidebar() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const isAdmin = useSelector((state) => state.auth.user?.role === 'admin');
  const sections = isAdmin ? [...SECTIONS, ADMIN_SECTION] : SECTIONS;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
      isActive ? 'bg-white/10 font-medium text-white' : 'text-[#c3c2b7] hover:bg-white/5 hover:text-white'
    }`;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-[#14171c] transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 items-center px-5 text-white">
        <Brand to="/app" />
      </div>
      <nav aria-label="Main" className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-1 px-3 text-[11px] font-medium tracking-wide text-[#898781]">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={linkClass}
                  onClick={() => dispatch(setSidebarOpen(false))}
                >
                  <link.icon className="size-4 shrink-0" aria-hidden="true" />
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
