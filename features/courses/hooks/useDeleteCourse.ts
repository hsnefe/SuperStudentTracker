import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { deleteCourse } from "../api/deleteCourse";
import { coursesGridQueryKey } from "./useCoursesGridData";

export function useDeleteCourse() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => {
      if (!user) throw new Error("Not authenticated");
      return deleteCourse(user.uid, courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesGridQueryKey });
    },
  });
}
