import { createSlice } from '@reduxjs/toolkit';

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    organizations: [],
    // null means the signed-in user's personal workspace.
    activeId: Number(localStorage.getItem('activeOrganizationId')) || null,
  },
  reducers: {
    setOrganizations: (state, action) => {
      state.organizations = action.payload;
      // Removed from the active organization on another device: fall back to personal.
      if (state.activeId && !action.payload.some((org) => org.id === state.activeId)) {
        state.activeId = null;
        localStorage.removeItem('activeOrganizationId');
      }
    },
    setActiveWorkspace: (state, action) => {
      state.activeId = action.payload;
      if (action.payload) localStorage.setItem('activeOrganizationId', String(action.payload));
      else localStorage.removeItem('activeOrganizationId');
    },
  },
});

export default workspaceSlice.reducer;

export const { setOrganizations, setActiveWorkspace } = workspaceSlice.actions;
