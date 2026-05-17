import { useEffect, useState } from 'react';
import { MenuItem } from './MenuItem';
import { Moon, Sun } from 'lucide-react';

type ThemeControlProps = {
  withLabel?: boolean;
}

export const ThemeControl = ({ withLabel = false }: ThemeControlProps) => {
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
      icon={theme === 'dark' ? <Sun /> : <Moon />}
      label={theme === 'dark' ? 'Light' : 'Dark'}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      key={1}
      testId='toolbar.menu.theme'
      hiddenLabel={!withLabel}
    />
  );
};
