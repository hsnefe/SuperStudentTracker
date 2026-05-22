import { useQuery } from "@tanstack/react-query";
import { listTodos } from "@/features/todos/api/listTodos";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { ListTodosQuery } from "@/types";
import { ensureTodosMigrated } from "./ensureTodosMigrated";
import { todosListQueryKey } from "./queryKeys";

export function useTodos(query: ListTodosQuery = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: todosListQueryKey(user?.uid, query),
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      await ensureTodosMigrated(user.uid);
      return listTodos(user.uid, query);
    },
    enabled: Boolean(user),
  });
}
