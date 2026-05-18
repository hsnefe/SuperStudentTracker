import type { Weekday } from "@/types";

/** Monday = 1 … Sunday = 7 → grid dayIndex 0 … 6 */
export function weekdayToDayIndex(weekday: Weekday): number {
  return weekday - 1;
}

export function dayIndexToWeekday(dayIndex: number): Weekday {
  const w = (dayIndex + 1) as Weekday;
  if (w < 1 || w > 7) return 1;
  return w;
}

export function formatMinutesAsTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Parses "HH:MM" or "H:MM" into minutes from midnight; null if invalid. */
export function parseTimeToMinutes(input: string): number | null {
  const trimmed = input.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const h = Number.parseInt(match[1], 10);
  const m = Number.parseInt(match[2], 10);
  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return null;
  }
  return h * 60 + m;
}

export function durationLabel(startMinutes: number, endMinutes: number): string {
  const dur = Math.max(0, endMinutes - startMinutes);
  const h = Math.floor(dur / 60);
  const m = dur % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
}

export function newScheduleSlotId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
