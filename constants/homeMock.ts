import type { Assignment } from "@/types";

/** Placeholder content aligned with Figma dev export (nodes 4:79, 4:90). */
export const MOCK_HOME_ASSIGNMENTS: Assignment[] = [
  {
    id: "a1",
    courseId: "mock-cv",
    title: "Assignment 1",
    description: "Task Description dbasbdhsabdhabjasdnjas",
    type: "essay",
    deadline: "2026-05-20",
    priority: "high",
    status: "in_progress",
    tasks: [
      { id: "t1", title: "Task 1", done: true },
      { id: "t2", title: "Task 2", done: false },
      { id: "t3", title: "Task3s", done: false },
    ],
  },
  {
    id: "a2",
    courseId: "mock-prompt",
    title: "Assignment 2",
    description: "Task Description dbasbdhsabdhabjasdnjas",
    type: "group_project",
    deadline: "2026-06-01",
    priority: "medium",
    status: "not_started",
    tasks: [
      { id: "t4", title: "Task 1", done: true },
      { id: "t5", title: "Task 2", done: true },
      { id: "t6", title: "Task3s", done: false },
    ],
  },
  {
    id: "a3",
    courseId: "mock-cloud",
    title: "Assignment 3",
    description: "Task Description dbasbdhsabdhabjasdnjas",
    type: "exam",
    deadline: "2026-05-28",
    priority: "emergent",
    status: "pending_review",
    tasks: [
      { id: "t7", title: "Task 1", done: false },
      { id: "t8", title: "Task 2", done: false },
      { id: "t9", title: "Task3s", done: false },
    ],
  },
];
