import type { CourseAbsenceRecord, ScheduleSlot, Weekday } from "@/types";

export function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** ISO date → Weekday (Monday = 1 … Sunday = 7). */
export function isoDateToWeekday(iso: string): Weekday {
  const d = parseIsoDate(iso);
  const jsDay = d.getDay();
  const weekday = jsDay === 0 ? 7 : jsDay;
  return weekday as Weekday;
}

export function slotsForWeekday(slots: ScheduleSlot[], weekday: Weekday): ScheduleSlot[] {
  return slots.filter((s) => s.weekday === weekday);
}

export function absencesForDate(records: CourseAbsenceRecord[], iso: string): CourseAbsenceRecord[] {
  return records.filter((r) => r.date === iso);
}

export function canAddAbsenceToday(
  slots: ScheduleSlot[],
  records: CourseAbsenceRecord[],
  dateIso: string = todayIsoDate(),
): boolean {
  const weekday = isoDateToWeekday(dateIso);
  const daySlots = slotsForWeekday(slots, weekday);
  if (daySlots.length === 0) return false;
  const todayCount = absencesForDate(records, dateIso).length;
  return todayCount < daySlots.length;
}

export function newAbsenceId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function addAbsenceToday(
  records: CourseAbsenceRecord[],
  courseId: string,
  dateIso: string = todayIsoDate(),
): CourseAbsenceRecord[] {
  return [
    ...records,
    {
      id: newAbsenceId(),
      courseId,
      date: dateIso,
    },
  ];
}

export function computeAbsencePercent(count: number, tolerance: number): number {
  if (tolerance <= 0) return 0;
  return Math.min(100, Math.round((count / tolerance) * 100));
}

export function formatPercentLabel(count: number, tolerance: number): string {
  return `${computeAbsencePercent(count, tolerance)}%`;
}

export function formatAbsenceCaption(count: number, tolerance: number): string {
  if (tolerance <= 0) return "No tolerance set";
  return `${count} of ${tolerance} absences used`;
}

export type AbsenceDayGroup = {
  date: string;
  label: string;
  count: number;
};

function ordinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function formatAbsenceDayLabel(iso: string): string {
  const d = parseIsoDate(iso);
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const day = d.getDate();
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  return `${month} ${day}${ordinalSuffix(day)} ${weekday}`;
}

export function groupAbsencesByDate(records: CourseAbsenceRecord[]): AbsenceDayGroup[] {
  const byDate = new Map<string, number>();
  for (const r of records) {
    byDate.set(r.date, (byDate.get(r.date) ?? 0) + 1);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, count]) => ({
      date,
      label: formatAbsenceDayLabel(date),
      count,
    }));
}

export function formatAbsenceCountLabel(count: number): string {
  return `${count} absence${count === 1 ? "" : "s"}`;
}
