import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { updateMaterialTitle } from "../api/updateMaterial";
import { courseMaterialsListKey } from "./queryKeys";

export function useUpdateMaterial(courseId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ materialId, title }: { materialId: string; title: string }) => {
      if (!user) throw new Error("Not authenticated");
      return updateMaterialTitle(user.uid, courseId, materialId, title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseMaterialsListKey(user?.uid, courseId),
      });
    },
  });
}
