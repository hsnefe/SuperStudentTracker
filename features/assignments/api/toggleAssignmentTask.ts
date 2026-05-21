import { findAssignment } from "@/features/assignments/api/findAssignment";
import { normalizeAssignment } from "@/lib/assignmentNormalize";
import { loadAssignments, saveAssignments } from "@/lib/persistence/courseAssignments";
import type { Assignment } from "@/types";

export async function toggleAssignmentTask(
  uid: string,
  routeCourseId: string,
  assignmentId: string,
  taskId: string,
): Promise<Assignment> {
  const found = await findAssignment(uid, routeCourseId, assignmentId);
  if (!found) {
    throw new Error("Assignment not found");
  }

  const { assignment: existing, bucketId } = found;
  const hasTask = existing.tasks.some((t) => t.id === taskId);
  if (!hasTask) {
    throw new Error("Task not found");
  }

  const updated = normalizeAssignment({
    ...existing,
    tasks: existing.tasks.map((t) =>
      t.id === taskId ? { ...t, done: true } : t,
    ),
  });

  const list = await loadAssignments(uid, bucketId);
  const next = list.map((a) => (a.id === assignmentId ? updated : a));
  await saveAssignments(uid, bucketId, next);
  return updated;
}
