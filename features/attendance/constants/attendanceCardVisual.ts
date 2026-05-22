/** Shared palette for attendance stat card and detail modal. */
export const ATTENDANCE_CARD_BG = "#fff";
export const ATTENDANCE_CARD_ACCENT = "#FF653F";
export const ATTENDANCE_CARD_TEXT = "#1a1a1f";
export const ATTENDANCE_CARD_CAPTION = "#3a3a42";
export const ATTENDANCE_CARD_BORDER = "rgba(58,58,66,0.14)";
export const ATTENDANCE_CARD_MUTED = "rgba(58,58,66,0.55)";

/** Frosted glass overlay — warm white, aligned with stat card (#fff / #FF653F). */
export const ATTENDANCE_MODAL_GLASS_OVERLAY = [
  "rgba(255,255,255,0.55)",
  "rgba(255,255,255,0.82)",
  "rgba(255,252,248,0.94)",
] as const;

export const ATTENDANCE_MODAL_GLASS_OVERLAY_WEB = [
  "rgba(255,255,255,0.88)",
  "rgba(255,255,255,0.94)",
  "rgba(255,252,248,0.98)",
] as const;

export const ATTENDANCE_MODAL_GLASS_FROST = "rgba(255,255,255,0.35)";
