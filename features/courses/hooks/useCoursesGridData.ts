import { useQuery } from "@tanstack/react-query";
import { fetchCoursesGrid } from "../api/fetchCoursesGrid";

export const coursesGridQueryKey = ["coursesGrid"] as const;

export function useCoursesGridData() {
  return useQuery({
    queryKey: coursesGridQueryKey,
    queryFn: fetchCoursesGrid,
  });
}
