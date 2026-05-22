import type { TodoItem } from "@/types";

export function stripPrerequisiteRefs(todos: TodoItem[], deletedId: string): TodoItem[] {
  const now = new Date().toISOString();
  let changed = false;

  const next = todos.map((t) => {
    if (!t.prerequisiteIds.includes(deletedId)) return t;
    changed = true;
    return {
      ...t,
      prerequisiteIds: t.prerequisiteIds.filter((id) => id !== deletedId),
      updatedAt: now,
    };
  });

  return changed ? next : todos;
}
