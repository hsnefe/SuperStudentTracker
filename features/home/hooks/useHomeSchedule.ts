import { useQuery } from "@tanstack/react-query";
import type { HomeScheduleBlock } from "@/constants/homeSchedule";
import type { CourseGridItem } from "@/constants/coursesMock";
import { MOCK_COURSES_FALLBACK } from "@/constants/coursesMock";
import {
  WEEK_GRID_END_HOUR,
  WEEK_GRID_START_HOUR,
} from "@/constants/weekScheduleMock";
import { useCoursesGridData } from "@/features/courses/hooks/useCoursesGridData";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { loadCourseSchedule } from "@/lib/persistence/courseSchedule";
import { durationLabel, formatMinutesAsTime, weekdayToDayIndex } from "@/lib/scheduleTime";
import type { ScheduleSlot } from "@/types";

export const homeScheduleQueryKey = (uid: string | undefined, courseIds: string) =>
  ["homeSchedule", uid, courseIds] as const;

const GRID_START_MINUTE = WEEK_GRID_START_HOUR * 60;
const GRID_END_MINUTE = WEEK_GRID_END_HOUR * 60;

function resolveCourses(
  isPending: boolean,
  isError: boolean,
  data: CourseGridItem[] | undefined,
): CourseGridItem[] {
  if (isPending) return [];
  if (isError) return MOCK_COURSES_FALLBACK;
  return data ?? [];
}

function clipSlotToGrid(
  startMinute: number,
  endMinute: number,
): { startMinute: number; endMinute: number } | null {
  if (endMinute <= GRID_START_MINUTE || startMinute >= GRID_END_MINUTE) return null;
  const clippedStart = Math.max(startMinute, GRID_START_MINUTE);
  const clippedEnd = Math.min(endMinute, GRID_END_MINUTE);
  if (clippedEnd <= clippedStart) return null;
  return { startMinute: clippedStart, endMinute: clippedEnd };
}

function slotToBlock(
  slot: ScheduleSlot,
  courseTitle: string,
): HomeScheduleBlock | null {
  const clipped = clipSlotToGrid(slot.startMinutes, slot.endMinutes);
  if (!clipped) return null;

  const location = slot.location?.trim();
  const description = location || formatMinutesAsTime(slot.startMinutes);

  return {
    id: `${slot.courseId}:${slot.id}`,
    dayIndex: weekdayToDayIndex(slot.weekday),
    startMinute: clipped.startMinute,
    endMinute: clipped.endMinute,
    title: courseTitle,
    description,
    priority: "medium",
    durationLabel: durationLabel(clipped.startMinute, clipped.endMinute),
    commentCount: 0,
  };
}

async function fetchHomeScheduleBlocks(
  uid: string,
  courses: CourseGridItem[],
): Promise<HomeScheduleBlock[]> {
  const blocks: HomeScheduleBlock[] = [];

  await Promise.all(
    courses.map(async (course) => {
      const title = course.title?.trim() || "Course";
      const slots = await loadCourseSchedule(uid, course.id);
      if (!slots?.length) return;

      for (const slot of slots) {
        const block = slotToBlock({ ...slot, courseId: course.id }, title);
        if (block) blocks.push(block);
      }
    }),
  );

  return blocks;
}

export function useHomeSchedule() {
  const { user } = useAuth();
  const coursesQuery = useCoursesGridData();
  const courses = resolveCourses(
    coursesQuery.isPending,
    coursesQuery.isError,
    coursesQuery.data,
  );

  const scheduleQuery = useQuery({
    queryKey: homeScheduleQueryKey(user?.uid, courses.map((c) => c.id).join(",")),
    queryFn: () => fetchHomeScheduleBlocks(user!.uid, courses),
    enabled: !!user && courses.length > 0,
  });

  const loading = coursesQuery.isPending || scheduleQuery.isPending;

  return {
    blocks: scheduleQuery.data ?? [],
    loading,
    error: scheduleQuery.error,
    refetch: scheduleQuery.refetch,
  };
}
