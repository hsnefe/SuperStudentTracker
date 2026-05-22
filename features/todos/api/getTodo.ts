import { loadTodos } from "@/lib/persistence/todos";
import type { TodoItem } from "@/types";

export async function getTodo(uid: string, todoId: string): Promise<TodoItem | null> {
  const todos = await loadTodos(uid);
  return todos.find((t) => t.id === todoId) ?? null;
}
