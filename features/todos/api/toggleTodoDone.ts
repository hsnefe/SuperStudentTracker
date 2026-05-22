import { applyDoneCascade } from "@/features/todos/domain/applyDoneCascade";
import { nowIsoTimestamp } from "@/lib/todoNormalize";
import { loadTodos, saveTodos } from "@/lib/persistence/todos";
import type { TodoItem } from "@/types";

export async function toggleTodoDone(
  uid: string,
  todoId: string,
  done: boolean,
): Promise<TodoItem> {
  const todos = await loadTodos(uid);
  if (!todos.some((t) => t.id === todoId)) {
    throw new Error("Todo not found");
  }

  const updated = applyDoneCascade(todos, todoId, done);
  const ts = nowIsoTimestamp();
  const withTimestamp = updated.map((t) =>
    t.id === todoId && !done ? { ...t, updatedAt: ts } : t,
  );

  await saveTodos(uid, withTimestamp);

  const target = withTimestamp.find((t) => t.id === todoId);
  if (!target) {
    throw new Error("Todo not found after update");
  }

  return target;
}
