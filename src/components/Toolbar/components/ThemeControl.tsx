import { MenuItem } from './MenuItem';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

type ThemeControlProps = {
  withLabel?: boolean;
}

export const ThemeControl = ({ withLabel = false }: ThemeControlProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <MenuItem
      icon={theme === 'dark' ? <Sun /> : <Moon />}
      label={theme === 'dark' ? 'Light' : 'Dark'}
      onClick={toggleTheme}
      key={1}
      testId='toolbar.menu.theme'
      hiddenLabel={!withLabel}
    />
  );
};

