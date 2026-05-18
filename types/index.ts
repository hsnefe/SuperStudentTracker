export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Course = {
  id: string;
  name: string;
  code?: string;
  color?: string;
};

export type ScheduleSlot = {
  id: string;
  courseId: string;
  weekday: Weekday;
  startMinutes: number;
  endMinutes: number;
  location?: string;
};

/** Schedule slot without courseId — used when creating a course. */
export type CreateCourseScheduleSlot = Omit<ScheduleSlot, "courseId">;

export type CreateCourseInput = {
  title: string;
  lecturerName: string;
  absenceToleranceHours: number;
  gradeRows: CourseGradeBreakdownRow[];
  scheduleSlots: CreateCourseScheduleSlot[];
};

export type AttendanceStatus = "present" | "absent";

export type AttendanceRecord = {
  id: string;
  courseId: string;
  date: string;
  status: AttendanceStatus;
};

export type Task = {
  id: string;
  title: string;
  courseId?: string;
  dueDate?: string;
  done: boolean;
};

/** Firestore bucket id for assignments not tied to a course. */
export const NO_COURSE_ASSIGNMENTS_ID = "__none__";

export type AssignmentType =
  | "essay"
  | "reflective_paper"
  | "report"
  | "case_study"
  | "creative_writing"
  | "group_project"
  | "exam"
  | "quiz"
  | "worksheet"
  | "reading";

export type AssignmentPriority = "low" | "medium" | "high" | "emergent";

export type AssignmentStatus = "not_started" | "in_progress" | "pending_review";

export type Assignment = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  tasks: Task[];
  type: AssignmentType;
  deadline: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
};

export type CreateAssignmentInput = {
  title: string;
  type: AssignmentType;
  courseId: string;
  deadline: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
};

export type GradeComponent = {
  id: string;
  courseId: string;
  name: string;
  weight: number;
  score?: number;
};

/** Editable grading breakdown row shown on the course detail screen (weights + score labels like TBA). */
export type CourseGradeBreakdownRow = {
  id: string;
  label: string;
  weightPercent: number;
  scoreText: string;
};

export type Note = {
  id: string;
  courseId?: string;
  title: string;
  updatedAt: string;
};

export type NoteBlock = {
  id: string;
  noteId: string;
  type: "text" | "todo" | "heading" | "quote";
  content: string;
  order: number;
};

export type CourseMaterial = {
  id: string;
  courseId: string;
  title: string;
  kind: "pdf" | "slides" | "link";
  uri: string;
};
