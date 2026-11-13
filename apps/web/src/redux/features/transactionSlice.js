import { createSlice } from '@reduxjs/toolkit';

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: {
    items: [],
    total: 0,
    // Money in, out and pending for the current filters (any type), plus net.
    totals: { received: 0, sent: 0, pending: 0, net: 0 },
    counts: { received: 0, sent: 0, pending: 0 },
    loaded: false,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setTransactions: (state, action) => {
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.totals = action.payload.totals;
      state.counts = action.payload.counts;
      state.loaded = true;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export default transactionSlice.reducer;

export const { setLoading, setTransactions, setError } = transactionSlice.actions;
