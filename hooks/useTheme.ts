import { useThemeContext } from "../lib/theme";

export function useTheme() {
  const { theme, mode, toggleTheme } = useThemeContext();
  return { ...theme, mode, toggleTheme };
}
