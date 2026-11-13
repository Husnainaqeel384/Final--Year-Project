import { createSlice } from '@reduxjs/toolkit';

const reportSlice = createSlice({
  name: 'report',
  initialState: {
    months: [],
    report: null,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setMonths: (state, action) => {
      state.months = action.payload;
      state.loading = false;
    },
    setReport: (state, action) => {
      state.report = action.payload;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export default reportSlice.reducer;

export const { setLoading, setMonths, setReport, setError } = reportSlice.actions;
