import { assignmentStorageBucketId } from "@/features/assignments/api/createAssignment";
import { findAssignment } from "@/features/assignments/api/findAssignment";
import { normalizeAssignment } from "@/lib/assignmentNormalize";
import { loadAssignments, saveAssignments } from "@/lib/persistence/courseAssignments";
import type { Assignment, UpdateAssignmentInput } from "@/types";

export async function updateAssignment(
  uid: string,
  routeCourseId: string,
  assignmentId: string,
  input: UpdateAssignmentInput,
): Promise<Assignment> {
  const found = await findAssignment(uid, routeCourseId, assignmentId);
  if (!found) {
    throw new Error("Assignment not found");
  }

  const { assignment: existing, bucketId: oldBucketId } = found;
  const newBucketId = assignmentStorageBucketId(input.courseId);

  const updated = normalizeAssignment({
    ...existing,
    title: input.title.trim(),
    type: input.type,
    courseId: input.courseId,
    deadline: input.deadline,
    priority: input.priority,
    status: input.status,
  });

  if (oldBucketId === newBucketId) {
    const list = await loadAssignments(uid, oldBucketId);
    const next = list.map((a) => (a.id === assignmentId ? updated : a));
    await saveAssignments(uid, oldBucketId, next);
    return updated;
  }

  const oldList = await loadAssignments(uid, oldBucketId);
  await saveAssignments(
    uid,
    oldBucketId,
    oldList.filter((a) => a.id !== assignmentId),
  );

  const newList = await loadAssignments(uid, newBucketId);
  await saveAssignments(uid, newBucketId, [...newList, updated]);
  return updated;
}
