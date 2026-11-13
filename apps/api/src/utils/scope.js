/**
 * Row-level isolation lives here so no service writes its own ownership check.
 * Every query on a workspace-owned table must go through applyScope.
 */
export function applyScope(query, workspace, tableAlias) {
  const column = (name) => (tableAlias ? `${tableAlias}.${name}` : name);
  if (workspace.organizationId) {
    return query.where(column('organization_id'), workspace.organizationId);
  }
  return query.where(column('user_id'), workspace.userId).whereNull(column('organization_id'));
}

// Personal rows have no organization to belong to, so they go with their owner when an account is removed.
export const PERSONAL_TABLES = ['budgets', 'expenses', 'transactions', 'reminders', 'notes', 'webhooks'];

export const scopeColumns = (workspace) => ({
  user_id: workspace.userId,
  organization_id: workspace.organizationId,
});

export const scopeKey = (workspace) =>
  workspace.organizationId ? `o${workspace.organizationId}` : `u${workspace.userId}`;
