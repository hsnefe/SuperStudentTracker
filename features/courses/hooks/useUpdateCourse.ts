import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { UpdateCourseInput } from "@/types";
import { updateCourse } from "../api/updateCourse";
import { courseForEditQueryKey } from "./useCourseForEdit";
import { coursesGridQueryKey } from "./useCoursesGridData";

type Variables = {
  courseId: string;
  input: UpdateCourseInput;
};

export function useUpdateCourse() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, input }: Variables) => {
      if (!user) throw new Error("Not authenticated");
      return updateCourse(user.uid, courseId, input);
    },
    onSuccess: (_data, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: coursesGridQueryKey });
      queryClient.invalidateQueries({
        queryKey: courseForEditQueryKey(user?.uid, courseId),
      });
    },
  });
}
