import type { CourseGradeBreakdownRow } from "@/types";

const DEFAULT_GRADE_ROWS: CourseGradeBreakdownRow[] = [
  { id: "g-mid", label: "Midterm", weightPercent: 30, scoreText: "66" },
  { id: "g-q1", label: "Quiz1", weightPercent: 30, scoreText: "92" },
  { id: "g-fin", label: "Final", weightPercent: 40, scoreText: "TBA" },
];

/** Course detail — grading breakdown keyed by course id. */
export const MOCK_GRADE_ROWS_BY_COURSE_ID: Record<string, CourseGradeBreakdownRow[]> = {
  "mock-cv": DEFAULT_GRADE_ROWS,
  "mock-prompt": DEFAULT_GRADE_ROWS.map((r, i) =>
    i === 0 ? { ...r, scoreText: "72" } : { ...r },
  ),
  "mock-cloud": DEFAULT_GRADE_ROWS,
};

export function getMockGradeRowsForCourse(courseId: string): CourseGradeBreakdownRow[] {
  const rows = MOCK_GRADE_ROWS_BY_COURSE_ID[courseId];
  if (!rows) {
    return DEFAULT_GRADE_ROWS.map((r) => ({ ...r, id: `${r.id}-${courseId}` }));
  }
  return rows.map((r) => ({ ...r }));
}
