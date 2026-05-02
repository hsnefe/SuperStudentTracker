export const palette = {
  white: "#ffffff",
  ink900: "#0f1115",
  ink700: "#1f2330",
  ink500: "#3b4252",
  ink300: "#7a8194",
  ink100: "#cfd3dc",
  background: "#fafafa",
  surface: "#ffffff",
  border: "#e6e8ee",
  accent: "#111827",
  accentMuted: "#374151",
  success: "#16a34a",
  danger: "#dc2626",
  warning: "#d97706",
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
  success: string;
  danger: string;
  warning: string;
};

export const lightColors: ThemeColors = {
  background: palette.background,
  surface: palette.surface,
  border: palette.border,
  textPrimary: palette.ink900,
  textSecondary: palette.ink500,
  textMuted: palette.ink300,
  accent: palette.accent,
  accentMuted: palette.accentMuted,
  success: palette.success,
  danger: palette.danger,
  warning: palette.warning,
};
