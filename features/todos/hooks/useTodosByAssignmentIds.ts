import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listTodos } from "@/features/todos/api/listTodos";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { TodoItem } from "@/types";
import { ensureTodosMigrated } from "./ensureTodosMigrated";
import { todosByAssignmentIdsQueryKey } from "./queryKeys";

const EMPTY_TODOS_BY_ASSIGNMENT = new Map<string, TodoItem[]>();

function groupByAssignmentId(todos: TodoItem[]): Map<string, TodoItem[]> {
  const map = new Map<string, TodoItem[]>();
  for (const todo of todos) {
    if (!todo.assignmentId) continue;
    const list = map.get(todo.assignmentId) ?? [];
    list.push(todo);
    map.set(todo.assignmentId, list);
  }
  return map;
}

export function useTodosByAssignmentIds(assignmentIds: string[]) {
  const { user } = useAuth();
  const stableIds = useMemo(
    () => [...new Set(assignmentIds)].filter(Boolean).sort(),
    [assignmentIds],
  );

  const query = useQuery({
    queryKey: todosByAssignmentIdsQueryKey(user?.uid, stableIds),
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      await ensureTodosMigrated(user.uid);
      const todos = await listTodos(user.uid);
      return groupByAssignmentId(todos);
    },
    enabled: Boolean(user) && stableIds.length > 0,
  });

  const todosByAssignmentId = useMemo(
    () => query.data ?? EMPTY_TODOS_BY_ASSIGNMENT,
    [query.data],
  );

  return {
    todosByAssignmentId,
    loading: query.isPending,
    error: query.error,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}
