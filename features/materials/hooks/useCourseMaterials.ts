import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { loadMaterials } from "@/lib/persistence/courseMaterials";
import { courseMaterialsListKey } from "./queryKeys";

export function useCourseMaterials(courseId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: courseMaterialsListKey(user?.uid, courseId),
    queryFn: () => {
      if (!user) throw new Error("Not authenticated");
      return loadMaterials(user.uid, courseId);
    },
    enabled: Boolean(user && courseId),
  });
}
