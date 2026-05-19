import { useQuery } from "@tanstack/react-query";
import { findAssignment } from "@/features/assignments/api/findAssignment";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function assignmentDetailQueryKey(
  uid: string | undefined,
  routeCourseId: string,
  assignmentId: string,
) {
  return ["assignmentDetail", uid, routeCourseId, assignmentId] as const;
}

export function useAssignmentDetail(routeCourseId: string, assignmentId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: assignmentDetailQueryKey(user?.uid, routeCourseId, assignmentId),
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const found = await findAssignment(user.uid, routeCourseId, assignmentId);
      if (!found) throw new Error("Assignment not found");
      return found.assignment;
    },
    enabled: Boolean(user && routeCourseId && assignmentId),
  });
}
