import { useMemo } from "react";
import {
  ASSIGNMENT_PRIORITY_OPTIONS,
  ASSIGNMENT_STATUS_OPTIONS,
  ASSIGNMENT_TYPE_OPTIONS,
  NO_COURSE_OPTION,
  type SelectOption,
} from "@/constants/assignmentOptions";
import { MOCK_COURSES_FALLBACK } from "@/constants/coursesMock";
import { useCoursesGridData } from "@/features/courses/hooks/useCoursesGridData";
import type {
  AssignmentPriority,
  AssignmentStatus,
  AssignmentType,
  CreateAssignmentInput,
} from "@/types";

export function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDeadlineDisplay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function typeLabel(type: AssignmentType): string {
  return ASSIGNMENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export function priorityLabel(priority: AssignmentPriority): string {
  return ASSIGNMENT_PRIORITY_OPTIONS.find((o) => o.value === priority)?.label ?? priority;
}

const PRIORITY_ORDER: AssignmentPriority[] = ["low", "medium", "high", "emergent"];

const PRIORITY_DOT_COLORS: Record<AssignmentPriority, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  emergent: "#ef4444",
};

export function priorityDotColor(priority: AssignmentPriority): string {
  return PRIORITY_DOT_COLORS[priority];
}

export function cyclePriority(priority: AssignmentPriority): AssignmentPriority {
  const i = PRIORITY_ORDER.indexOf(priority);
  if (i < 0) return "low";
  return PRIORITY_ORDER[(i + 1) % PRIORITY_ORDER.length];
}

export function statusLabel(status: AssignmentStatus): string {
  return ASSIGNMENT_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function courseLabelFromOptions(courseId: string, options: SelectOption[]): string {
  return options.find((o) => o.value === courseId)?.label ?? courseId;
}

export function useAssignmentCourseOptions(defaultCourseId: string): SelectOption[] {
  const coursesQuery = useCoursesGridData();

  return useMemo((): SelectOption[] => {
    const base = coursesQuery.isSuccess
      ? (coursesQuery.data ?? [])
      : coursesQuery.isError
        ? MOCK_COURSES_FALLBACK
        : [];
    const fromGrid = base.map((c) => ({ value: c.id, label: c.title }));
    const hasDefault = fromGrid.some((o) => o.value === defaultCourseId);
    const merged = hasDefault
      ? fromGrid
      : defaultCourseId
        ? [{ value: defaultCourseId, label: "Current course" }, ...fromGrid]
        : fromGrid;
    return [NO_COURSE_OPTION, ...merged];
  }, [coursesQuery.data, coursesQuery.isError, coursesQuery.isSuccess, defaultCourseId]);
}

export type AssignmentFormValues = CreateAssignmentInput;

export function assignmentToFormValues(assignment: {
  title: string;
  type: AssignmentType;
  courseId: string;
  deadline: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
}): AssignmentFormValues {
  return {
    title: assignment.title,
    type: assignment.type,
    courseId: assignment.courseId,
    deadline: assignment.deadline,
    priority: assignment.priority,
    status: assignment.status,
  };
}
