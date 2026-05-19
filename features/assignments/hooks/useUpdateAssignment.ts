import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAssignment } from "@/features/assignments/api/updateAssignment";
import { assignmentDetailQueryKey } from "@/features/assignments/hooks/useAssignmentDetail";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { UpdateAssignmentInput } from "@/types";

type Variables = {
  routeCourseId: string;
  assignmentId: string;
  input: UpdateAssignmentInput;
};

export function useUpdateAssignment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ routeCourseId, assignmentId, input }: Variables) => {
      if (!user) throw new Error("Not authenticated");
      return updateAssignment(user.uid, routeCourseId, assignmentId, input);
    },
    onSuccess: (data, { routeCourseId, assignmentId }) => {
      queryClient.setQueryData(
        assignmentDetailQueryKey(user?.uid, routeCourseId, assignmentId),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: ["assignmentDetail", user?.uid],
      });
    },
  });
}
