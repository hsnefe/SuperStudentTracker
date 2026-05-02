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

export type GradeComponent = {
  id: string;
  courseId: string;
  name: string;
  weight: number;
  score?: number;
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
