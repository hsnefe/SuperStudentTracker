import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleAssignmentTask } from "@/features/assignments/api/toggleAssignmentTask";
import { homeAssignmentsQueryKey } from "@/features/home/hooks/useHomeAssignments";
import { useAuth } from "@/features/auth/hooks/useAuth";

type Variables = {
  routeCourseId: string;
  assignmentId: string;
  taskId: string;
};

export function useToggleAssignmentTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routeCourseId, assignmentId, taskId }: Variables) => {
      if (!user) throw new Error("Not authenticated");
      return toggleAssignmentTask(user.uid, routeCourseId, assignmentId, taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: homeAssignmentsQueryKey(user?.uid),
      });
    },
  });
}
