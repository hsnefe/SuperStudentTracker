import { useThemeContext, type Theme } from "@/lib/theme";

export function useTheme(): Theme {
  return useThemeContext();
}
