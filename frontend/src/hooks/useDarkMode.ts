import { useEffect, useState } from 'react';

const STORAGE_KEY = 'page-pulse:theme';

function getInitialTheme(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Toggles Tailwind's `dark` class on <html>, persisting the choice. */
export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((prev) => !prev) };
}
