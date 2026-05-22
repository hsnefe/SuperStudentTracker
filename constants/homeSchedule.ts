import type { SchedulePriority } from "@/constants/weekScheduleMock";

export type HomeScheduleBlock = {
  id: string;
  dayIndex: number;
  startMinute: number;
  endMinute: number;
  title: string;
  description: string;
  priority: SchedulePriority;
  durationLabel: string;
  commentCount: number;
};
