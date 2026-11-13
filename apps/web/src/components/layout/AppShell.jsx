import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSidebarOpen } from '../../redux/features/uiSlice';
import { PageLoader } from '../ui/Feedback';
import DemoBanner from './DemoBanner';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function AppShell() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  return (
    <div className="min-h-screen lg:pl-60">
      <title>Budget Book</title>
      <meta name="robots" content="noindex" />

      <Sidebar />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-hidden="true"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <Topbar />
      <main className="max-w-[1920px] p-4 sm:p-6 lg:p-8">
        <DemoBanner />
        {/* Local boundary keeps the sidebar and top bar in place while a page loads. */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

export default AppShell;
