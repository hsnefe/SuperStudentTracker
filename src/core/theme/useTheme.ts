import { useThemeContext } from "./ThemeProvider";

export function useTheme() {
  const { theme, mode, toggleTheme } = useThemeContext();
  return { ...theme, mode, toggleTheme };
}
