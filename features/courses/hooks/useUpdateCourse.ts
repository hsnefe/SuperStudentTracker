import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateCourseInput } from "@/types";
import { updateCourse } from "../api/updateCourse";
import { courseForEditQueryKey } from "./useCourseForEdit";
import { coursesGridQueryKey } from "./useCoursesGridData";

type Variables = {
  courseId: string;
  input: UpdateCourseInput;
};

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, input }: Variables) => updateCourse(courseId, input),
    onSuccess: (_data, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: coursesGridQueryKey });
      queryClient.invalidateQueries({ queryKey: courseForEditQueryKey(courseId) });
    },
  });
}
