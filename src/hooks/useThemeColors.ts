import { useSettingsStore } from '../stores/useSettingsStore';
import { darkColors, lightColors, ThemeColors } from '../theme/colors';

export function useThemeColors(): ThemeColors {
  const theme = useSettingsStore((s) => s.theme);
  return theme === 'light' ? lightColors : darkColors;
}
