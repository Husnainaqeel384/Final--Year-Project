import { createSlice } from '@reduxjs/toolkit';
import { clearUser } from './authSlice';

/**
 * Which AI provider the person has connected. The key itself is never here:
 * the server keeps it, and a demo visitor's key stays in sessionStorage.
 */
const initialState = {
  providers: [],
  saved: null,
  // A demo visitor's key for this tab only, as { provider, model, keyHint }.
  session: null,
  // Requests made, limits and recent activity, as returned by GET /ai/usage.
  usage: null,
  loaded: false,
  loading: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setAiSettings: (state, action) => {
      state.providers = action.payload.providers;
      state.saved = action.payload.saved;
      state.loaded = true;
      state.loading = false;
    },
    setSaved: (state, action) => {
      state.saved = action.payload;
    },
    setSession: (state, action) => {
      state.session = action.payload;
    },
    setUsage: (state, action) => {
      state.usage = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  // The next person to sign in on this browser starts with nothing loaded.
  extraReducers: (builder) => {
    builder.addCase(clearUser, () => initialState);
  },
});

export default aiSlice.reducer;

export const { setLoading, setAiSettings, setSaved, setSession, setUsage, setError } = aiSlice.actions;
