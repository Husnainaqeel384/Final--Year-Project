import { createSlice } from '@reduxjs/toolkit';

const EMPTY_FIGURE = { count: 0, amount: 0 };

const reminderSlice = createSlice({
  name: 'reminder',
  initialState: {
    items: [],
    total: 0,
    counts: { open: 0, done: 0 },
    summary: { overdue: EMPTY_FIGURE, week: EMPTY_FIGURE, month: EMPTY_FIGURE, paid: EMPTY_FIGURE },
    // Separate from `loading` so a refresh keeps the list on screen instead of flashing skeletons.
    loaded: false,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setReminders: (state, action) => {
      const { items, total, counts, summary } = action.payload;
      state.items = items;
      state.total = total;
      state.counts = counts;
      state.summary = summary;
      state.loaded = true;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export default reminderSlice.reducer;

export const { setLoading, setReminders, setError } = reminderSlice.actions;
