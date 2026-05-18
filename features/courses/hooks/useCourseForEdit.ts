import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchCourseForEdit } from "../api/fetchCourseForEdit";

export function courseForEditQueryKey(uid: string | undefined, courseId: string) {
  return ["courseForEdit", uid, courseId] as const;
}

export function useCourseForEdit(courseId: string, enabled: boolean) {
  const { user } = useAuth();

  return useQuery({
    queryKey: courseForEditQueryKey(user?.uid, courseId),
    queryFn: () => fetchCourseForEdit(user!.uid, courseId),
    enabled: enabled && courseId.length > 0 && !!user,
  });
}
