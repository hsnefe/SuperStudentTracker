import { todosById } from "@/lib/todoNormalize";
import type { TodoItem } from "@/types";

/** Collects todoId and all transitive prerequisites (ancestors). */
export function collectCascadeDoneIds(todoId: string, todos: TodoItem[]): Set<string> {
  const byId = todosById(todos);
  const result = new Set<string>();
  const visiting = new Set<string>();

  function visit(id: string): void {
    if (result.has(id)) return;
    if (visiting.has(id)) return;
    visiting.add(id);

    const todo = byId.get(id);
    if (!todo) return;

    result.add(id);
    for (const pid of todo.prerequisiteIds) {
      visit(pid);
    }
    visiting.delete(id);
  }

  visit(todoId);
  return result;
}

export function applyDoneCascade(todos: TodoItem[], targetId: string, done: boolean): TodoItem[] {
  if (!done) {
    return todos.map((t) => (t.id === targetId ? { ...t, done: false } : t));
  }

  const idsToMark = collectCascadeDoneIds(targetId, todos);
  const now = new Date().toISOString();

  return todos.map((t) =>
    idsToMark.has(t.id) ? { ...t, done: true, updatedAt: now } : t,
  );
}
