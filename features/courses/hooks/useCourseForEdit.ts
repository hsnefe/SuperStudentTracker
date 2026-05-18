import { useQuery } from "@tanstack/react-query";
import { fetchCourseForEdit } from "../api/fetchCourseForEdit";

export function courseForEditQueryKey(courseId: string) {
  return ["courseForEdit", courseId] as const;
}

export function useCourseForEdit(courseId: string, enabled: boolean) {
  return useQuery({
    queryKey: courseForEditQueryKey(courseId),
    queryFn: () => fetchCourseForEdit(courseId),
    enabled: enabled && courseId.length > 0,
  });
}
