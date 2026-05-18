import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCourse } from "../api/deleteCourse";
import { coursesGridQueryKey } from "./useCoursesGridData";

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesGridQueryKey });
    },
  });
}
