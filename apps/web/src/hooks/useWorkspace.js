import { useSelector } from 'react-redux';

/** The active workspace, with the currency every amount on screen should use. */
export function useWorkspace() {
  const user = useSelector((state) => state.auth.user);
  const { organizations, activeId } = useSelector((state) => state.workspace);
  const organization = organizations.find((org) => org.id === activeId) || null;

  return {
    activeId,
    organization,
    currency: organization?.currency || user?.currency || 'USD',
    // Personal workspace owners can do everything; in a team this depends on the member's role.
    canManage: !organization || ['owner', 'admin'].includes(organization.role),
  };
}
