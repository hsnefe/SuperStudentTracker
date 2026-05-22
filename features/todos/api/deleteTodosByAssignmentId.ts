import { deleteDoc } from "firebase/firestore";
import { stripPrerequisiteRefs } from "@/features/todos/domain/stripPrerequisiteRefs";
import { userTodoDoc } from "@/lib/firestore/userPaths";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import { loadTodos, saveTodos } from "@/lib/persistence/todos";

export async function deleteTodosByAssignmentId(
  uid: string,
  assignmentId: string,
): Promise<number> {
  const todos = await loadTodos(uid);
  const deleteIds = new Set(
    todos.filter((t) => t.assignmentId === assignmentId).map((t) => t.id),
  );
  if (deleteIds.size === 0) return 0;

  let remaining = todos;
  for (const id of deleteIds) {
    remaining = stripPrerequisiteRefs(remaining, id);
  }
  remaining = remaining.filter((t) => !deleteIds.has(t.id));

  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      await Promise.all(
        [...deleteIds].map((id) => deleteDoc(userTodoDoc(db, uid, id))),
      );
    } catch {
      /* fall through to local cache */
    }
  }

  await saveTodos(uid, remaining);
  return deleteIds.size;
}
