import { migrateNestedTasksToGlobalTodos } from "@/features/todos/api/migrateNestedTasksToGlobalTodos";

const migratedUids = new Set<string>();

export async function ensureTodosMigrated(uid: string): Promise<void> {
  if (migratedUids.has(uid)) return;
  await migrateNestedTasksToGlobalTodos(uid);
  migratedUids.add(uid);
}

/** Test-only reset */
export function resetTodosMigrationCache(): void {
  migratedUids.clear();
}
