import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginDemo } from '../../api/authApi';
import { getErrorMessage } from '../../api/client';
import { setUser } from '../../redux/features/authSlice';
import { setOrganizations } from '../../redux/features/workspaceSlice';
import { Button } from '../ui/Button';

/** One click into the demo account, so a visitor can judge the app before signing up. */
export function DemoButton({ variant = 'primary', size, className = '', children = 'Try the live demo' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const start = async () => {
    try {
      setLoading(true);
      const { user, organizations } = await loginDemo();
      dispatch(setOrganizations(organizations));
      dispatch(setUser(user));
      navigate('/app');
    } catch (error) {
      toast.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} loading={loading} onClick={start} className={className}>
      {children}
    </Button>
  );
}
