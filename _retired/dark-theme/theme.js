import { create } from 'zustand';

// Marketing-site colour theme. Light is the default; a visitor's choice of
// dark is remembered in this browser only.
const KEY = 'mf-theme';

function readSaved() {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export const useTheme = create((set, get) => ({
  theme: readSaved(),
  toggleTheme: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* storage blocked: the choice lasts for this visit */
    }
    set({ theme });
  },
}));
