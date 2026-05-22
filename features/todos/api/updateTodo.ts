import { assertNoPrerequisiteCycle } from "@/features/todos/domain/detectPrerequisiteCycle";
import { validateUpdateTodoInput } from "@/features/todos/domain/validateTodoInput";
import { nowIsoTimestamp } from "@/lib/todoNormalize";
import { loadTodos, saveTodo } from "@/lib/persistence/todos";
import type { TodoItem, UpdateTodoInput } from "@/types";

export async function updateTodo(
  uid: string,
  todoId: string,
  input: UpdateTodoInput,
): Promise<TodoItem> {
  const todos = await loadTodos(uid);
  const index = todos.findIndex((t) => t.id === todoId);
  if (index < 0) {
    throw new Error("Todo not found");
  }

  const patch = validateUpdateTodoInput(input, todos, todoId);
  const existing = todos[index];
  const merged: TodoItem = {
    ...existing,
    ...patch,
    updatedAt: nowIsoTimestamp(),
  };

  if (patch.prerequisiteIds !== undefined) {
    const nextGraph = todos.map((t) => (t.id === todoId ? merged : t));
    assertNoPrerequisiteCycle(todoId, merged.prerequisiteIds, nextGraph);
  }

  await saveTodo(uid, merged);
  return merged;
}
