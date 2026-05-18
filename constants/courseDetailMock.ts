import type { CourseGradeBreakdownRow } from "@/types";

/** Default grading breakdown when nothing is persisted yet (English copy per plan). */
const DEFAULT_BY_COURSE: Record<string, CourseGradeBreakdownRow[]> = {
  "mock-cv": [
    { id: "g-mid", label: "Midterm", weightPercent: 30, scoreText: "66" },
    { id: "g-q1", label: "Quiz1", weightPercent: 30, scoreText: "92" },
    { id: "g-fin", label: "Final", weightPercent: 40, scoreText: "TBA" },
  ],
  "mock-prompt": [
    { id: "g-p1", label: "Project", weightPercent: 50, scoreText: "TBA" },
    { id: "g-p2", label: "Participation", weightPercent: 50, scoreText: "TBA" },
  ],
  "mock-cloud": [
    { id: "g-labs", label: "Labs", weightPercent: 35, scoreText: "88" },
    { id: "g-exam", label: "Exam", weightPercent: 65, scoreText: "TBA" },
  ],
};

const FALLBACK: CourseGradeBreakdownRow[] = [
  { id: "g-a", label: "Component A", weightPercent: 40, scoreText: "TBA" },
  { id: "g-b", label: "Component B", weightPercent: 35, scoreText: "TBA" },
  { id: "g-c", label: "Component C", weightPercent: 25, scoreText: "TBA" },
];

export function getMockGradeRowsForCourse(courseId: string): CourseGradeBreakdownRow[] {
  return DEFAULT_BY_COURSE[courseId] ?? FALLBACK;
}

/** Initial grade breakdown rows for the create-course modal. */
export const DEFAULT_CREATE_GRADE_ROWS: CourseGradeBreakdownRow[] = [
  { id: "new-g-mid", label: "Vize", weightPercent: 40, scoreText: "TBA" },
  { id: "new-g-fin", label: "Final", weightPercent: 60, scoreText: "TBA" },
];
