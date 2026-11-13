import { createSlice } from '@reduxjs/toolkit';

const transactionSlice = createSlice({
  name: 'transaction',
  initialState: {
    items: [],
    total: 0,
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
