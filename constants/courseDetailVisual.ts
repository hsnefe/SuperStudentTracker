/** Total vertical blur transition height split evenly between hero bottom and assignments top. */
export const COURSE_BLUR_BRIDGE_TOTAL_PX = 88;
export const COURSE_BLUR_BRIDGE_HALF_PX = COURSE_BLUR_BRIDGE_TOTAL_PX / 2;

/** Minimum height of course hero (`resim1`) as a fraction of window height. */
export const COURSE_HERO_MIN_HEIGHT_RATIO = 0.62;

/**
 * Minimum height of assignments block (`resim2`) as a fraction of the hero minimum height
 * (not window height): heroMinPx * this value.
 */
export const COURSE_ASSIGNMENTS_MIN_HEIGHT_RATIO_OF_HERO = 0.8;

export function courseHeroMinHeightPx(windowHeight: number): number {
  return Math.round(windowHeight * COURSE_HERO_MIN_HEIGHT_RATIO);
}

export function courseAssignmentsMinHeightPx(windowHeight: number): number {
  return Math.round(courseHeroMinHeightPx(windowHeight) * COURSE_ASSIGNMENTS_MIN_HEIGHT_RATIO_OF_HERO);
}
