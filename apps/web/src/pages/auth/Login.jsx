import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../../api/authApi';
import { getErrorMessage } from '../../api/client';
import { setUser } from '../../redux/features/authSlice';
import { setOrganizations } from '../../redux/features/workspaceSlice';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';

function Login() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const { user, organizations } = await login(form);
      dispatch(setOrganizations(organizations));
      dispatch(setUser(user));
    } catch (error) {
      toast.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account."
      pageTitle="Sign in"
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="text-accent-text font-medium">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} />
        <Input label="Password" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={update} />
        <div className="text-right">
          <Link to="/forgot-password" className="text-accent-text text-[13px]">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Login;
