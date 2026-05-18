import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchCoursesGrid } from "../api/fetchCoursesGrid";

export const coursesGridQueryKey = ["coursesGrid"] as const;

export function useCoursesGridData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...coursesGridQueryKey, user?.uid],
    queryFn: () => fetchCoursesGrid(user!.uid),
    enabled: !!user,
  });
}
