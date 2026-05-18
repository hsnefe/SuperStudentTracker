import type { CourseGridItem } from "@/constants/coursesMock";
import { addDoc, collection } from "firebase/firestore";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import { saveGradeBreakdown } from "@/lib/persistence/courseGradeBreakdown";
import { saveCourseSchedule } from "@/lib/persistence/courseSchedule";
import type { CreateCourseInput } from "@/types";

export async function createCourse(input: CreateCourseInput): Promise<CourseGridItem> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }

  const trimmed = input.title.trim() || "Untitled course";
  const lecturer = input.lecturerName.trim();
  const absenceHours = Math.max(0, input.absenceToleranceHours);

  const db = getFirebaseFirestore();
  const docRef = await addDoc(collection(db, "courses"), {
    title: trimmed,
    image_url: null,
    lecturer_name: lecturer,
    absence_tolerance_hours: absenceHours,
  });

  const courseId = docRef.id;

  await Promise.all([
    saveGradeBreakdown(courseId, input.gradeRows),
    saveCourseSchedule(
      courseId,
      input.scheduleSlots.map((s) => ({ ...s, courseId })),
    ),
  ]);

  return {
    id: courseId,
    title: trimmed,
    imageUrl: null,
    assignmentCount: 0,
  };
}
