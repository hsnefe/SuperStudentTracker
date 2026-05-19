import type { AssignmentStripCardVariant } from "@/components/course/AssignmentStripCardBackground";

/** Matches AssignmentStripCard cardTitle / textLight. */
export function stripCardTitleColor(variant: AssignmentStripCardVariant): string {
  return variant === 1 ? "#fff" : "rgba(255,255,255,0.95)";
}

/** Matches AssignmentStripCard descMuted / descLight. */
export function stripCardMetaColor(variant: AssignmentStripCardVariant): string {
  return variant === 1 ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.72)";
}

export const STRIP_CARD_META_SEPARATOR = "rgba(255,255,255,0.45)";
