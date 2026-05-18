import { doc, getDoc } from "firebase/firestore";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import { loadCourseSchedule } from "@/lib/persistence/courseSchedule";
import type { CourseEditSnapshot, CreateCourseScheduleSlot } from "@/types";

type CourseDoc = {
  title?: string | null;
  name?: string | null;
  lecturer_name?: string | null;
  absence_tolerance_hours?: number | null;
  image_url?: string | null;
  cover_url?: string | null;
};

function scheduleToCreateSlots(
  slots: Awaited<ReturnType<typeof loadCourseSchedule>>,
): CreateCourseScheduleSlot[] {
  if (!slots?.length) return [];
  return slots.map(({ id, weekday, startMinutes, endMinutes, location }) => ({
    id,
    weekday,
    startMinutes,
    endMinutes,
    location,
  }));
}

export async function fetchCourseForEdit(courseId: string): Promise<CourseEditSnapshot> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }

  const db = getFirebaseFirestore();
  const [courseSnap, scheduleSlots] = await Promise.all([
    getDoc(doc(db, "courses", courseId)),
    loadCourseSchedule(courseId),
  ]);

  if (!courseSnap.exists()) {
    throw new Error("Course not found");
  }

  const data = courseSnap.data() as CourseDoc;
  const title = (data.title ?? data.name ?? "Untitled course").trim() || "Untitled course";
  const lecturerName = (data.lecturer_name ?? "").trim();
  const absenceRaw = data.absence_tolerance_hours;
  const absenceToleranceHours =
    typeof absenceRaw === "number" && Number.isFinite(absenceRaw) ? Math.max(0, absenceRaw) : 0;
  const imageUrl = data.image_url ?? data.cover_url ?? null;

  return {
    title,
    lecturerName,
    absenceToleranceHours,
    imageUrl,
    scheduleSlots: scheduleToCreateSlots(scheduleSlots),
  };
}
