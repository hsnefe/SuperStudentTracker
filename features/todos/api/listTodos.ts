import { filterAndSortTodos } from "@/features/todos/domain/filterAndSortTodos";
import { loadTodos } from "@/lib/persistence/todos";
import type { ListTodosQuery, TodoItem } from "@/types";

export async function listTodos(uid: string, query: ListTodosQuery = {}): Promise<TodoItem[]> {
  const todos = await loadTodos(uid);
  return filterAndSortTodos(todos, query);
}
