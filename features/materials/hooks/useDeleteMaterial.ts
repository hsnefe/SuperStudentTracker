import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { deleteMaterial } from "../api/deleteMaterial";
import { courseMaterialsListKey } from "./queryKeys";

export function useDeleteMaterial(courseId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (materialId: string) => {
      if (!user) throw new Error("Not authenticated");
      return deleteMaterial(user.uid, courseId, materialId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseMaterialsListKey(user?.uid, courseId),
      });
    },
  });
}
