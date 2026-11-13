import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPassword } from '../../api/authApi';
import { getErrorMessage } from '../../api/client';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password !== confirm) {
      toast.error('The passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      const { message } = await resetPassword({ token, password });
      toast.success(message);
      navigate('/login');
    } catch (error) {
      toast.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={submit} className="space-y-4">
        <Input label="New password" type="password" autoComplete="new-password" required minLength={8} hint="At least 8 characters." value={password} onChange={(event) => setPassword(event.target.value)} />
        <Input label="Confirm password" type="password" autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        <Button type="submit" loading={loading} className="w-full">
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
