/** In-memory fallbacks used when Firebase is unavailable on web. */
const assignmentMemory = new Map<string, unknown[]>();
const scheduleMemory = new Map<string, unknown[]>();
const gradeMemory = new Map<string, unknown[]>();
const attendanceMemory = new Map<string, unknown[]>();

export function getAssignmentMemory() {
  return assignmentMemory;
}

export function getScheduleMemory() {
  return scheduleMemory;
}

export function getGradeMemory() {
  return gradeMemory;
}

export function getAttendanceMemory() {
  return attendanceMemory;
}

export function clearPersistenceMemoryCaches(): void {
  assignmentMemory.clear();
  scheduleMemory.clear();
  gradeMemory.clear();
  attendanceMemory.clear();
}
