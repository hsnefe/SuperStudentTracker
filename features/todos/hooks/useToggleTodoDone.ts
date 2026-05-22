import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleTodoDone } from "@/features/todos/api/toggleTodoDone";
import { assignmentDetailQueryKey } from "@/features/assignments/hooks/useAssignmentDetail";
import { homeAssignmentsQueryKey } from "@/features/home/hooks/useHomeAssignments";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { todosQueryKeyRoot } from "./queryKeys";

type Variables = {
  todoId: string;
  done: boolean;
};

export function useToggleTodoDone() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ todoId, done }: Variables) => {
      if (!user) throw new Error("Not authenticated");
      return toggleTodoDone(user.uid, todoId, done);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeyRoot });
      queryClient.invalidateQueries({
        queryKey: homeAssignmentsQueryKey(user?.uid),
      });
      queryClient.invalidateQueries({
        queryKey: ["assignmentDetail", user?.uid],
      });
    },
  });
}
