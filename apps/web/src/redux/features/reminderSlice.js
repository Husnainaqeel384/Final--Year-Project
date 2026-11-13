import { createSlice } from '@reduxjs/toolkit';

const reminderSlice = createSlice({
  name: 'reminder',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setReminders: (state, action) => {
      state.items = action.payload;
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
