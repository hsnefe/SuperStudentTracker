import { createContext, useContext, useMemo, type ReactNode } from "react";
import { lightColors, radius, spacing, typography, type ThemeColors } from "./tokens";

export type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  radius,
  typography,
};

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo<Theme>(() => lightTheme, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): Theme {
  return useContext(ThemeContext);
}
