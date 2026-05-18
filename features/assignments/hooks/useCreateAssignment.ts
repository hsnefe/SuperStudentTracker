import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createAssignment } from "../api/createAssignment";
import type { CreateAssignmentInput } from "@/types";

export function useCreateAssignment() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: CreateAssignmentInput) => {
      if (!user) throw new Error("Not authenticated");
      return createAssignment(user.uid, input);
    },
  });
}
