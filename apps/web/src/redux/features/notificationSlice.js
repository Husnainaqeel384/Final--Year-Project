import { createSlice } from '@reduxjs/toolkit';

const EMPTY_FIGURE = { count: 0, amount: 0 };

/**
 * Reminders that need attention: overdue or due within a few days. Shown by the
 * bell in the top bar and the alert strip on the dashboard.
 */
const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    items: [],
    total: 0,
    overdue: EMPTY_FIGURE,
    soon: EMPTY_FIGURE,
    windowDays: 3,
    loaded: false,
    loading: false,
    error: null,
    // Bumped whenever a reminder changes, so every view that shows reminders reloads.
    version: 0,
  },
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setAlerts: (state, action) => {
      const { items, total, overdue, soon, windowDays } = action.payload;
      state.items = items;
      state.total = total;
      state.overdue = overdue;
      state.soon = soon;
      state.windowDays = windowDays;
      state.loaded = true;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    refreshAlerts: (state) => {
      state.version += 1;
    },
  },
});

export default notificationSlice.reducer;

export const { setLoading, setAlerts, setError, refreshAlerts } = notificationSlice.actions;
