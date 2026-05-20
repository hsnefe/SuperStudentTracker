import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createMaterial } from "../api/createMaterial";
import type { CourseMaterial, CreateMaterialInput } from "@/types";
import { courseMaterialsListKey } from "./queryKeys";

export function useUploadMaterial(courseId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMaterialInput) => {
      if (!user) throw new Error("Not authenticated");
      const cached = queryClient.getQueryData<CourseMaterial[]>(
        courseMaterialsListKey(user.uid, courseId),
      );
      return createMaterial(user.uid, input, cached);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseMaterialsListKey(user?.uid, courseId),
      });
    },
  });
}
