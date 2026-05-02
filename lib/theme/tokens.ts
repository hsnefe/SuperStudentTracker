/** Solid UI palette; assignment description strips use a separate gradient (accent → highlight). */
export const palette = {
  primaryDark: "#1E104E",
  secondaryDark: "#452E5A",
  accent: "#FF653F",
  highlight: "#FFC85C",
  white: "#ffffff",
  borderOnDark: "rgba(255,255,255,0.14)",
  textOnDark: "#f4f4f8",
  textOnDarkSecondary: "rgba(244,244,248,0.78)",
  textOnDarkMuted: "rgba(244,244,248,0.5)",
  success: "#4ade80",
  danger: "#f87171",
  warning: "#fbbf24",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: "700" as const },
  heading: { fontSize: 20, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const },
  caption: { fontSize: 13, fontWeight: "500" as const },
} as const;

export type ThemeColors = {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentMuted: string;
  highlight: string;
  primaryDark: string;
  secondaryDark: string;
  success: string;
  danger: string;
  warning: string;
};

export const lightColors: ThemeColors = {
  background: palette.primaryDark,
  surface: palette.secondaryDark,
  border: palette.borderOnDark,
  textPrimary: palette.textOnDark,
  textSecondary: palette.textOnDarkSecondary,
  textMuted: palette.textOnDarkMuted,
  accent: palette.accent,
  accentMuted: palette.textOnDarkMuted,
  highlight: palette.highlight,
  primaryDark: palette.primaryDark,
  secondaryDark: palette.secondaryDark,
  success: palette.success,
  danger: palette.danger,
  warning: palette.warning,
};
