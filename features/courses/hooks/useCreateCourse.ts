import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCourse } from "../api/createCourse";
import { coursesGridQueryKey } from "./useCoursesGridData";

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coursesGridQueryKey });
    },
  });
}
