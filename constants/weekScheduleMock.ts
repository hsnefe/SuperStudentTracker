/** Mock week grid — Mon(0) … Sun(6); minutes from midnight local time. */
export type SchedulePriority = "done" | "low" | "medium" | "high" | "break";

export type MockScheduleBlock = {
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

export const WEEK_GRID_START_HOUR = 9;
export const WEEK_GRID_END_HOUR = 19;

export const WEEK_DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

/** Sample blocks roughly matching dashboard-style density (photo reference). */
export const MOCK_WEEK_SCHEDULE_BLOCKS: MockScheduleBlock[] = [
  {
    id: "b1",
    dayIndex: 0,
    startMinute: 9 * 60 + 30,
    endMinute: 11 * 60 + 15,
    title: "Design Brief Review",
    description: "Stakeholder sync & scope freeze.",
    priority: "done",
    durationLabel: "01h 45m",
    commentCount: 24,
  },
  {
    id: "b2",
    dayIndex: 1,
    startMinute: 10 * 60,
    endMinute: 11 * 60 + 30,
    title: "Color Palette Selection",
    description: "Brand tokens & contrast checks.",
    priority: "medium",
    durationLabel: "01h 30m",
    commentCount: 118,
  },
  {
    id: "b3",
    dayIndex: 2,
    startMinute: 11 * 60,
    endMinute: 12 * 60 + 45,
    title: "Research Interview Prep",
    description: "Guides, incentives, calendar invites.",
    priority: "high",
    durationLabel: "01h 45m",
    commentCount: 56,
  },
  {
    id: "b4",
    dayIndex: 3,
    startMinute: 12 * 60 + 30,
    endMinute: 13 * 60 + 15,
    title: "Break",
    description: "Lunch & recharge.",
    priority: "break",
    durationLabel: "00h 45m",
    commentCount: 0,
  },
  {
    id: "b5",
    dayIndex: 4,
    startMinute: 13 * 60 + 30,
    endMinute: 15 * 60,
    title: "Prototype Critique",
    description: "Flows v2 — annotation pass.",
    priority: "low",
    durationLabel: "01h 30m",
    commentCount: 31,
  },
  {
    id: "b6",
    dayIndex: 5,
    startMinute: 14 * 60,
    endMinute: 15 * 60 + 45,
    title: "Specs Handoff",
    description: "Components & spacing tokens.",
    priority: "high",
    durationLabel: "01h 45m",
    commentCount: 72,
  },
  {
    id: "b7",
    dayIndex: 6,
    startMinute: 15 * 60 + 30,
    endMinute: 17 * 60,
    title: "Weekly Retro",
    description: "What shipped, what blocked.",
    priority: "medium",
    durationLabel: "01h 30m",
    commentCount: 14,
  },
];
