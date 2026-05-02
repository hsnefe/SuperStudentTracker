import type { Assignment } from "@/types";

/** Placeholder content aligned with Figma dev export (nodes 4:79, 4:90). */
export const MOCK_HOME_ASSIGNMENTS: Assignment[] = [
  {
    id: "a1",
    title: "Assignment 1",
    description: "Task Description dbasbdhsabdhabjasdnjas",
    tasks: [
      { id: "t1", title: "Task 1", done: true },
      { id: "t2", title: "Task 2", done: false },
      { id: "t3", title: "Task3s", done: false },
    ],
  },
  {
    id: "a2",
    title: "Assignment 2",
    description: "Task Description dbasbdhsabdhabjasdnjas",
    tasks: [
      { id: "t4", title: "Task 1", done: true },
      { id: "t5", title: "Task 2", done: true },
      { id: "t6", title: "Task3s", done: false },
    ],
  },
  {
    id: "a3",
    title: "Assignment 3",
    description: "Task Description dbasbdhsabdhabjasdnjas",
    tasks: [
      { id: "t7", title: "Task 1", done: false },
      { id: "t8", title: "Task 2", done: false },
      { id: "t9", title: "Task3s", done: false },
    ],
  },
];
