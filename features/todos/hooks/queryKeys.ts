import type { ListTodosQuery } from "@/types";

export const todosQueryKeyRoot = ["todos"] as const;

export function todosListQueryKey(uid: string | undefined, query?: ListTodosQuery) {
  return [...todosQueryKeyRoot, uid, query ?? {}] as const;
}

export function todosByAssignmentIdsQueryKey(
  uid: string | undefined,
  assignmentIds: string[],
) {
  const sorted = [...assignmentIds].sort().join(",");
  return [...todosQueryKeyRoot, "byAssignment", uid, sorted] as const;
}
