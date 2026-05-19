import { assignmentStorageBucketId } from "@/features/assignments/api/createAssignment";
import { loadAssignments } from "@/lib/persistence/courseAssignments";
import { NO_COURSE_ASSIGNMENTS_ID, type Assignment } from "@/types";

export type FoundAssignment = {
  assignment: Assignment;
  bucketId: string;
};

async function findInBucket(
  uid: string,
  bucketId: string,
  assignmentId: string,
): Promise<FoundAssignment | null> {
  const list = await loadAssignments(uid, bucketId);
  const assignment = list.find((a) => a.id === assignmentId);
  if (!assignment) return null;
  return { assignment, bucketId };
}

/** Locate an assignment in the route course bucket, then the no-course bucket. */
export async function findAssignment(
  uid: string,
  routeCourseId: string,
  assignmentId: string,
): Promise<FoundAssignment | null> {
  const routeBucket = assignmentStorageBucketId(routeCourseId);
  const fromRoute = await findInBucket(uid, routeBucket, assignmentId);
  if (fromRoute) return fromRoute;

  if (routeBucket !== NO_COURSE_ASSIGNMENTS_ID) {
    const fromNone = await findInBucket(uid, NO_COURSE_ASSIGNMENTS_ID, assignmentId);
    if (fromNone) return fromNone;
  }

  return null;
}
