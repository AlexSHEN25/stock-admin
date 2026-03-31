export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app_theme';
const THEME_ATTR_KEY = 'data-theme';

export const getCurrentTheme = (): AppTheme => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  return raw === 'dark' ? 'dark' : 'light';
};

export const setCurrentTheme = (theme: AppTheme) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.setAttribute(THEME_ATTR_KEY, theme);
};

export const toggleCurrentTheme = () => {
  const nextTheme: AppTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  setCurrentTheme(nextTheme);
  return nextTheme;
};

export const initTheme = () => {
  setCurrentTheme(getCurrentTheme());
};
