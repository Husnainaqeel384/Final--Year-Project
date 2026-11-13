import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: document.documentElement.dataset.theme || 'light',
    sidebarOpen: false,
  },
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.theme);
      // Updated here, before React re-renders, because charts read these CSS tokens during render.
      document.documentElement.dataset.theme = state.theme;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export default uiSlice.reducer;

export const { toggleTheme, setSidebarOpen } = uiSlice.actions;
