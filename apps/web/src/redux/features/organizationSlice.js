import { createSlice } from '@reduxjs/toolkit';

const organizationSlice = createSlice({
  name: 'organization',
  initialState: {
    detail: null,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setDetail: (state, action) => {
      state.detail = action.payload;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export default organizationSlice.reducer;

export const { setLoading, setDetail, setError } = organizationSlice.actions;
