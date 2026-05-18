import { newAssignmentId, normalizeAssignment } from "@/lib/assignmentNormalize";
import { loadAssignments, saveAssignments } from "@/lib/persistence/courseAssignments";
import { NO_COURSE_ASSIGNMENTS_ID, type Assignment, type CreateAssignmentInput } from "@/types";

export function assignmentStorageBucketId(courseId: string): string {
  return courseId === NO_COURSE_ASSIGNMENTS_ID ? NO_COURSE_ASSIGNMENTS_ID : courseId;
}

export async function createAssignment(input: CreateAssignmentInput): Promise<Assignment> {
  const bucketId = assignmentStorageBucketId(input.courseId);
  const existing = await loadAssignments(bucketId);

  const assignment = normalizeAssignment({
    id: newAssignmentId(),
    courseId: input.courseId,
    title: input.title.trim(),
    description: "",
    tasks: [],
    type: input.type,
    deadline: input.deadline,
    priority: input.priority,
    status: input.status,
  });

  await saveAssignments(bucketId, [...existing, assignment]);
  return assignment;
}
