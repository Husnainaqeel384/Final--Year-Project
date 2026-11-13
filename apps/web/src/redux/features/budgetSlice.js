import { createSlice } from '@reduxjs/toolkit';

const budgetSlice = createSlice({
  name: 'budget',
  initialState: {
    items: [],
    // Years that have budgets, for the year picker on the Budgets page.
    years: [],
    detail: null,
    // "null" is a valid answer (no budget this month), so loaded is tracked separately.
    detailLoaded: false,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setBudgets: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },
    setYears: (state, action) => {
      state.years = action.payload;
    },
    setDetail: (state, action) => {
      state.detail = action.payload;
      state.detailLoaded = true;
      state.loading = false;
    },
    clearDetail: (state) => {
      state.detail = null;
      state.detailLoaded = false;
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    removeBudget: (state, action) => {
      state.items = state.items.filter((budget) => budget.id !== action.payload);
    },
  },
});

export default budgetSlice.reducer;

export const { setLoading, setBudgets, setYears, setDetail, clearDetail, setError, removeBudget } =
  budgetSlice.actions;
