import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register } from '../../api/authApi';
import { getErrorMessage } from '../../api/client';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';

const EMPTY = { firstName: '', lastName: '', username: '', email: '', password: '' };

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const { message } = await register(form);
      toast.success(message);
      navigate('/login');
    } catch (error) {
      toast.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free forever. No card needed."
      pageTitle="Sign up"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-accent-text font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" name="firstName" autoComplete="given-name" required maxLength={50} value={form.firstName} onChange={update} />
          <Input label="Last name" name="lastName" autoComplete="family-name" required maxLength={50} value={form.lastName} onChange={update} />
        </div>
        <Input label="Username" name="username" autoComplete="username" required minLength={3} maxLength={30} value={form.username} onChange={update} />
        <Input label="Email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} />
        <Input label="Password" name="password" type="password" autoComplete="new-password" required minLength={8} hint="At least 8 characters." value={form.password} onChange={update} />
        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Register;
