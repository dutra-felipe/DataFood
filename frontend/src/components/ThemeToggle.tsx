import { useTheme } from '../hooks/useTheme';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={styles.toggleButton}
      onClick={toggleTheme}
      title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}