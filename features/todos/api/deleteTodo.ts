import { stripPrerequisiteRefs } from "@/features/todos/domain/stripPrerequisiteRefs";
import { deleteTodoDoc, loadTodos, saveTodos } from "@/lib/persistence/todos";

export async function deleteTodo(uid: string, todoId: string): Promise<void> {
  const todos = await loadTodos(uid);
  if (!todos.some((t) => t.id === todoId)) {
    throw new Error("Todo not found");
  }

  const stripped = stripPrerequisiteRefs(todos, todoId);
  const remaining = stripped.filter((t) => t.id !== todoId);

  await deleteTodoDoc(uid, todoId);
  await saveTodos(uid, remaining);
}
