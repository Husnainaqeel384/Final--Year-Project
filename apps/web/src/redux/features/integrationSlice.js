import { createSlice } from '@reduxjs/toolkit';

const integrationSlice = createSlice({
  name: 'integration',
  initialState: {
    feeds: [],
    webhooks: [],
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setFeeds: (state, action) => {
      state.feeds = action.payload;
      state.loading = false;
    },
    setWebhooks: (state, action) => {
      state.webhooks = action.payload;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export default integrationSlice.reducer;

export const { setLoading, setFeeds, setWebhooks, setError } = integrationSlice.actions;
