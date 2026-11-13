import { createSlice } from '@reduxjs/toolkit';

const splitSlice = createSlice({
  name: 'split',
  initialState: {
    groups: [],
    contacts: [],
    group: null,
    loading: false,
    error: null,
  },
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setGroups: (state, action) => {
      state.groups = action.payload;
      state.loading = false;
    },
    setContacts: (state, action) => {
      state.contacts = action.payload;
    },
    setGroup: (state, action) => {
      state.group = action.payload;
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export default splitSlice.reducer;

export const { setLoading, setGroups, setContacts, setGroup, setError } = splitSlice.actions;
