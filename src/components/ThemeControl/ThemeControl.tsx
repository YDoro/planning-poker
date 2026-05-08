import { useEffect, useState } from 'react';
import { MenuItem } from '../Toolbar/MenuItem';

export const ThemeControl = () => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => mq.matches ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <MenuItem
      icon={theme === 'dark' ? '☀️' : '🌙'}
      label={theme === 'dark' ? 'Light' : 'Dark'}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      key={1}
      testId='toolbar.menu.theme'
    />
  );
};
