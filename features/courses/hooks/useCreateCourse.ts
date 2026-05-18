import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createCourse } from "../api/createCourse";
import { coursesGridQueryKey } from "./useCoursesGridData";

export function useCreateCourse() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof createCourse>[1]) => {
      if (!user) throw new Error("Not authenticated");
      return createCourse(user.uid, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesGridQueryKey });
    },
  });
}
