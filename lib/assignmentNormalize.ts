import {
  DEFAULT_ASSIGNMENT_PRIORITY,
  DEFAULT_ASSIGNMENT_STATUS,
  DEFAULT_ASSIGNMENT_TYPE,
} from "@/constants/assignmentOptions";
import type {
  Assignment,
  AssignmentPriority,
  AssignmentStatus,
  AssignmentType,
} from "@/types";

const VALID_TYPES = new Set<string>([
  "essay",
  "reflective_paper",
  "report",
  "case_study",
  "creative_writing",
  "group_project",
  "exam",
  "quiz",
  "worksheet",
  "reading",
]);

const VALID_PRIORITIES = new Set<string>(["low", "medium", "high", "emergent"]);
const VALID_STATUSES = new Set<string>(["not_started", "in_progress", "pending_review"]);

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function coerceType(raw: unknown): AssignmentType {
  if (typeof raw === "string" && VALID_TYPES.has(raw)) return raw as AssignmentType;
  return DEFAULT_ASSIGNMENT_TYPE;
}

function coercePriority(raw: unknown): AssignmentPriority {
  if (typeof raw === "string" && VALID_PRIORITIES.has(raw)) return raw as AssignmentPriority;
  return DEFAULT_ASSIGNMENT_PRIORITY;
}

function coerceStatus(raw: unknown): AssignmentStatus {
  if (typeof raw === "string" && VALID_STATUSES.has(raw)) return raw as AssignmentStatus;
  return DEFAULT_ASSIGNMENT_STATUS;
}

function coerceDeadline(raw: unknown): string {
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return todayIsoDate();
}

/** Ensures legacy assignment records have required metadata fields. */
export function normalizeAssignment(raw: Partial<Assignment> & Pick<Assignment, "id" | "title">): Assignment {
  return {
    id: raw.id,
    courseId: raw.courseId ?? "",
    title: raw.title,
    description: raw.description ?? "",
    tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
    type: coerceType(raw.type),
    deadline: coerceDeadline(raw.deadline),
    priority: coercePriority(raw.priority),
    status: coerceStatus(raw.status),
  };
}

export function normalizeAssignments(list: unknown[]): Assignment[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((item): item is Partial<Assignment> & Pick<Assignment, "id" | "title"> => {
      return item != null && typeof item === "object" && "id" in item && "title" in item;
    })
    .map((item) => normalizeAssignment(item));
}

export function assignmentBucketId(courseId: string): string {
  return courseId;
}

export function newAssignmentId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
