import { getDocs } from "firebase/firestore";
import { MOCK_HOME_ASSIGNMENTS } from "@/constants/homeMock";
import { newTodoId, normalizeTodo, nowIsoTimestamp } from "@/lib/todoNormalize";
import { normalizeAssignment } from "@/lib/assignmentNormalize";
import { userCourseAssignmentsCollection } from "@/lib/firestore/userPaths";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import { loadAssignments, saveAssignments } from "@/lib/persistence/courseAssignments";
import { loadTodos, saveTodos } from "@/lib/persistence/todos";
import { NO_COURSE_ASSIGNMENTS_ID, type Task, type TodoItem } from "@/types";

export type MigrateNestedTasksResult = {
  migratedCount: number;
  clearedAssignmentBuckets: number;
};

function taskToTodo(task: Task, assignmentId: string, courseId: string, ts: string): TodoItem {
  return normalizeTodo({
    id: newTodoId(),
    name: task.title.trim() || "Untitled task",
    done: task.done,
    assignmentId,
    courseId: courseId === NO_COURSE_ASSIGNMENTS_ID ? task.courseId : courseId,
    deadline: task.dueDate,
    prerequisiteIds: [],
    createdAt: ts,
    updatedAt: ts,
  });
}

async function listAssignmentBucketIds(uid: string): Promise<string[]> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      const snap = await getDocs(userCourseAssignmentsCollection(db, uid));
      const ids = snap.docs.map((d) => d.id);
      if (ids.length > 0) return ids;
    } catch {
      /* fall through */
    }
  }

  const fromMock = new Set(MOCK_HOME_ASSIGNMENTS.map((a) => a.courseId));
  fromMock.add(NO_COURSE_ASSIGNMENTS_ID);
  return [...fromMock];
}

export async function migrateNestedTasksToGlobalTodos(
  uid: string,
): Promise<MigrateNestedTasksResult> {
  const existing = await loadTodos(uid);
  const bucketIds = await listAssignmentBucketIds(uid);
  const ts = nowIsoTimestamp();
  const newTodos: TodoItem[] = [];
  let clearedBuckets = 0;

  for (const bucketId of bucketIds) {
    const assignments = await loadAssignments(uid, bucketId);
    let bucketChanged = false;

    const nextAssignments = assignments.map((assignment) => {
      if (!assignment.tasks.length) return assignment;

      for (const task of assignment.tasks) {
        newTodos.push(taskToTodo(task, assignment.id, assignment.courseId, ts));
      }

      bucketChanged = true;
      return normalizeAssignment({ ...assignment, tasks: [] });
    });

    if (bucketChanged) {
      await saveAssignments(uid, bucketId, nextAssignments);
      clearedBuckets += 1;
    }
  }

  if (newTodos.length > 0) {
    await saveTodos(uid, [...existing, ...newTodos]);
  }

  return {
    migratedCount: newTodos.length,
    clearedAssignmentBuckets: clearedBuckets,
  };
}
