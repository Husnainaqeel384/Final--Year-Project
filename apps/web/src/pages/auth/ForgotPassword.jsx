import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword } from '../../api/authApi';
import { getErrorMessage } from '../../api/client';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await forgotPassword(email);
      setSent(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={sent ? undefined : "Enter your email and we'll send you a reset link."}
      footer={
        <Link to="/login" className="text-accent-text font-medium">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <p className="text-ink-2 text-sm">
          If an account exists for {email}, a reset link is on its way. The link expires in 30 minutes.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button type="submit" loading={loading} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;
