import { makeMutable } from "react-native-reanimated";

export type CourseDetailSection = "home" | "materials" | "grades";
export type PillTabLayout = { x: number; width: number };

/** Persists across route changes so the pill can animate between Home / Materials / Grades. */
export const pillIndicatorX = makeMutable(0);
export const pillIndicatorW = makeMutable(0);
export const pillIndicatorReady = makeMutable(0);

export const pillTabLayouts: Partial<Record<CourseDetailSection, PillTabLayout>> = {};
export let pillHasLaidOut = false;

export function markPillLaidOut() {
  pillHasLaidOut = true;
}
