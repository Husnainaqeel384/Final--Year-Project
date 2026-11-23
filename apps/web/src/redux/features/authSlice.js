import { createSlice } from '@reduxjs/toolkit';
import { clearAiSession } from '../../lib/aiSession';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

const initialState = {
  // Holds display details only, for an instant first paint. The session itself is an httpOnly cookie.
  user: readStoredUser(),
  // False until the API has confirmed whether the session is still valid.
  checked: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.checked = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearUser: (state) => {
      state.user = null;
      state.checked = true;
      localStorage.removeItem('user');
      localStorage.removeItem('activeOrganizationId');
      // A demo visitor's AI key must not outlive their visit.
      clearAiSession();
    },
  },
});

export default authSlice.reducer;

export const { setUser, clearUser } = authSlice.actions;
