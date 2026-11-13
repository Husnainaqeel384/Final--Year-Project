import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { acceptInvitation, fetchOrganizations } from '../../api/workspaceApi';
import { getErrorMessage } from '../../api/client';
import { setActiveWorkspace, setOrganizations } from '../../redux/features/workspaceSlice';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button, buttonClass } from '../../components/ui/Button';

function AcceptInvitation() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);

  const accept = async () => {
    try {
      setLoading(true);
      const { organizationId } = await acceptInvitation(token);
      dispatch(setOrganizations(await fetchOrganizations()));
      dispatch(setActiveWorkspace(organizationId));
      toast.success('You have joined the organization.');
      navigate('/app');
    } catch (error) {
      toast.error(getErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="You've been invited" subtitle="Join an organization on Budget Book.">
      {user ? (
        <>
          <p className="text-ink-2 mb-4 text-sm">
            You are signed in as {user.email}. The invitation must have been sent to this address.
          </p>
          <Button loading={loading} onClick={accept} className="w-full">
            Accept invitation
          </Button>
        </>
      ) : (
        <>
          <p className="text-ink-2 mb-4 text-sm">
            Sign in or create an account with the invited email address, then open this link again.
          </p>
          <Link to="/login" className={`${buttonClass('primary')} w-full`}>
            Sign in
          </Link>
        </>
      )}
    </AuthLayout>
  );
}

export default AcceptInvitation;
