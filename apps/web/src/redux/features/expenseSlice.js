import { createSlice } from '@reduxjs/toolkit';

const expenseSlice = createSlice({
  name: 'expense',
  initialState: {
    // Totals, daily chart and one page of categories, each category listed once.
    summary: null,
    // The category currently expanded, with one page of its expenses.
    open: null,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setSummary: (state, action) => {
      state.summary = action.payload;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    openCategory: (state, action) => {
      state.open = { categoryName: action.payload, items: [], total: 0, page: 1, loading: true };
    },
    setCategoryExpenses: (state, action) => {
      if (state.open?.categoryName !== action.payload.categoryName) return;
      state.open = { ...state.open, ...action.payload, loading: false };
    },
    closeCategory: (state) => {
      state.open = null;
    },
  },
});

export default expenseSlice.reducer;

export const { setLoading, setSummary, setError, openCategory, setCategoryExpenses, closeCategory } =
  expenseSlice.actions;
