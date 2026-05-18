import { NO_COURSE_ASSIGNMENTS_ID } from "@/types";
import type { AssignmentPriority, AssignmentStatus, AssignmentType } from "@/types";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

export const ASSIGNMENT_TYPE_OPTIONS: SelectOption<AssignmentType>[] = [
  { value: "essay", label: "Essay" },
  { value: "reflective_paper", label: "Reflective paper" },
  { value: "report", label: "Report" },
  { value: "case_study", label: "Case study" },
  { value: "creative_writing", label: "Creative writing" },
  { value: "group_project", label: "Group Project" },
  { value: "exam", label: "Exam" },
  { value: "quiz", label: "Quiz" },
  { value: "worksheet", label: "Worksheet" },
  { value: "reading", label: "Reading" },
];

export const ASSIGNMENT_PRIORITY_OPTIONS: SelectOption<AssignmentPriority>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "emergent", label: "Emergent" },
];

export const ASSIGNMENT_STATUS_OPTIONS: SelectOption<AssignmentStatus>[] = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending_review", label: "Pending Review" },
];

export const NO_COURSE_OPTION: SelectOption = {
  value: NO_COURSE_ASSIGNMENTS_ID,
  label: "No course",
};

export const DEFAULT_ASSIGNMENT_TYPE: AssignmentType = "essay";
export const DEFAULT_ASSIGNMENT_PRIORITY: AssignmentPriority = "medium";
export const DEFAULT_ASSIGNMENT_STATUS: AssignmentStatus = "not_started";
