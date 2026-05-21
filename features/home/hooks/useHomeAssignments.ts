import { useQuery } from "@tanstack/react-query";
import type { CourseGridItem } from "@/constants/coursesMock";
import { MOCK_COURSES_FALLBACK } from "@/constants/coursesMock";
import { useCoursesGridData } from "@/features/courses/hooks/useCoursesGridData";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { loadAssignments } from "@/lib/persistence/courseAssignments";
import type { Assignment } from "@/types";

export const homeAssignmentsQueryKey = (uid: string | undefined) =>
  ["homeAssignments", uid] as const;

export type HomeAssignmentItem = {
  assignment: Assignment;
  courseTitle?: string;
};

function resolveCourses(
  isPending: boolean,
  isError: boolean,
  data: CourseGridItem[] | undefined,
): CourseGridItem[] {
  if (isPending) return [];
  if (isError) return MOCK_COURSES_FALLBACK;
  return data ?? [];
}

function sortByDeadline(a: Assignment, b: Assignment): number {
  return a.deadline.localeCompare(b.deadline);
}

async function fetchAllAssignments(
  uid: string,
  courses: CourseGridItem[],
): Promise<HomeAssignmentItem[]> {
  const titleById = new Map(courses.map((c) => [c.id, c.title]));
  const lists = await Promise.all(
    courses.map((c) => loadAssignments(uid, c.id)),
  );

  const items: HomeAssignmentItem[] = [];
  for (let i = 0; i < courses.length; i++) {
    const courseId = courses[i].id;
    const courseTitle = titleById.get(courseId);
    for (const assignment of lists[i]) {
      items.push({
        assignment,
        courseTitle: courseTitle?.trim() || undefined,
      });
    }
  }

  items.sort((a, b) => sortByDeadline(a.assignment, b.assignment));
  return items;
}

export function useHomeAssignments() {
  const { user } = useAuth();
  const coursesQuery = useCoursesGridData();
  const courses = resolveCourses(
    coursesQuery.isPending,
    coursesQuery.isError,
    coursesQuery.data,
  );

  const assignmentsQuery = useQuery({
    queryKey: [...homeAssignmentsQueryKey(user?.uid), courses.map((c) => c.id).join(",")],
    queryFn: () => fetchAllAssignments(user!.uid, courses),
    enabled: !!user && courses.length > 0,
  });

  const loading = coursesQuery.isPending || assignmentsQuery.isPending;
  const items = assignmentsQuery.data ?? [];

  return {
    items,
    loading,
    coursesLoading: coursesQuery.isPending,
    error: assignmentsQuery.error,
    refetch: assignmentsQuery.refetch,
  };
}
