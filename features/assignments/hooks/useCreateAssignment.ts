import { useMutation } from "@tanstack/react-query";
import { createAssignment } from "../api/createAssignment";
import type { CreateAssignmentInput } from "@/types";

export function useCreateAssignment() {
  return useMutation({
    mutationFn: (input: CreateAssignmentInput) => createAssignment(input),
  });
}
