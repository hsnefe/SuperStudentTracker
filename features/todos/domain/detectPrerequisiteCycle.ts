import { todosById } from "@/lib/todoNormalize";
import type { TodoItem } from "@/types";

/**
 * Returns true if assigning `prerequisiteIds` to `todoId` would create a cycle
 * in the prerequisite graph (edge: prereq -> dependent).
 */
export function wouldCreatePrerequisiteCycle(
  todoId: string,
  prerequisiteIds: string[],
  todos: TodoItem[],
): boolean {
  const byId = todosById(todos);

  function reachesTodoFrom(nodeId: string, path: Set<string>): boolean {
    if (nodeId === todoId) return true;
    if (path.has(nodeId)) return false;

    path.add(nodeId);
    const node = byId.get(nodeId);
    if (!node) {
      path.delete(nodeId);
      return false;
    }

    for (const pid of node.prerequisiteIds) {
      if (reachesTodoFrom(pid, path)) {
        path.delete(nodeId);
        return true;
      }
    }
    path.delete(nodeId);
    return false;
  }

  for (const prereqId of prerequisiteIds) {
    if (reachesTodoFrom(prereqId, new Set())) return true;
  }

  return false;
}

export function assertNoPrerequisiteCycle(
  todoId: string,
  prerequisiteIds: string[],
  todos: TodoItem[],
): void {
  if (wouldCreatePrerequisiteCycle(todoId, prerequisiteIds, todos)) {
    throw new Error("Prerequisite graph contains a cycle");
  }
}
