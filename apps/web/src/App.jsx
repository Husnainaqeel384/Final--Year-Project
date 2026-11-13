import { lazy, Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { setUnauthorizedHandler } from './api/client';
import { fetchMe } from './api/authApi';
import { clearUser, setUser } from './redux/features/authSlice';
import { setOrganizations } from './redux/features/workspaceSlice';
import { PageLoader } from './components/ui/Feedback';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import AppShell from './components/layout/AppShell';

// Pages are split so visitors to the landing page do not download the whole dashboard.
const Home = lazy(() => import('./pages/marketing/Home'));
const About = lazy(() => import('./pages/marketing/About'));
const Contact = lazy(() => import('./pages/marketing/Contact'));
const Privacy = lazy(() => import('./pages/marketing/Privacy'));
const NotFound = lazy(() => import('./pages/marketing/NotFound'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const AcceptInvitation = lazy(() => import('./pages/auth/AcceptInvitation'));
const Dashboard = lazy(() => import('./pages/app/Dashboard'));
const Budgets = lazy(() => import('./pages/app/Budgets'));
const BudgetDetail = lazy(() => import('./pages/app/BudgetDetail'));
const Expenses = lazy(() => import('./pages/app/Expenses'));
const Transactions = lazy(() => import('./pages/app/Transactions'));
const Reports = lazy(() => import('./pages/app/Reports'));
const Reminders = lazy(() => import('./pages/app/Reminders'));
const Notes = lazy(() => import('./pages/app/Notes'));
const Splits = lazy(() => import('./pages/app/Splits'));
const SplitGroup = lazy(() => import('./pages/app/SplitGroup'));
const Integrations = lazy(() => import('./pages/app/Integrations'));
const Organization = lazy(() => import('./pages/app/Organization'));
const Profile = lazy(() => import('./pages/app/Profile'));
const Users = lazy(() => import('./pages/app/Users'));
const Categories = lazy(() => import('./pages/app/Categories'));

function RequireAuth() {
  const { user, checked } = useSelector((state) => state.auth);
  if (!checked && !user) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
}

function RequireAdmin() {
  const user = useSelector((state) => state.auth.user);
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/app" replace />;
}

/** Keeps signed-in users away from the login and sign-up forms. */
function GuestOnly() {
  const { user } = useSelector((state) => state.auth);
  return user ? <Navigate to="/app" replace /> : <Outlet />;
}

function App() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);

  useEffect(() => {
    setUnauthorizedHandler(() => dispatch(clearUser()));

    const restoreSession = async () => {
      // A first-time visitor has no session to restore, so don't make them wait on a 401.
      if (!localStorage.getItem('user')) {
        dispatch(clearUser());
        return;
      }
      try {
        const { user, organizations } = await fetchMe();
        dispatch(setUser(user));
        dispatch(setOrganizations(organizations));
      } catch {
        dispatch(clearUser());
      }
    };
    restoreSession();
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>
          <Route path="/invite/:token" element={<AcceptInvitation />} />

          <Route path="/app" element={<RequireAuth />}>
            <Route index element={<Dashboard />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="budgets/:id" element={<BudgetDetail />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="notes" element={<Notes />} />
            <Route path="splits" element={<Splits />} />
            <Route path="splits/:id" element={<SplitGroup />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="organization" element={<Organization />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<RequireAdmin />}>
              <Route path="users" element={<Users />} />
              <Route path="categories" element={<Categories />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ToastContainer position="top-right" autoClose={3000} theme={theme} newestOnTop />
    </ErrorBoundary>
  );
}

export default App;
