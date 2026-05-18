import { doc, updateDoc } from "firebase/firestore";
import type { CourseGridItem } from "@/constants/coursesMock";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import { saveCourseSchedule } from "@/lib/persistence/courseSchedule";
import type { UpdateCourseInput } from "@/types";
import {
  deleteCourseCoverImage,
  uploadCourseCoverImage,
} from "./uploadCourseCoverImage";

export type UpdateCourseResult = Pick<CourseGridItem, "id" | "title"> & {
  imageUrl?: string | null;
};

export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput,
): Promise<UpdateCourseResult> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }

  const trimmed = input.title.trim() || "Untitled course";
  const lecturer = input.lecturerName.trim();
  const absenceHours = Math.max(0, input.absenceToleranceHours);

  let imageUrl: string | null | undefined;

  if (input.imageUri === null) {
    await deleteCourseCoverImage(courseId);
    imageUrl = null;
  } else if (typeof input.imageUri === "string" && input.imageUri.length > 0) {
    imageUrl = await uploadCourseCoverImage(courseId, input.imageUri);
  }

  const db = getFirebaseFirestore();
  const patch: Record<string, unknown> = {
    title: trimmed,
    lecturer_name: lecturer,
    absence_tolerance_hours: absenceHours,
  };

  if (imageUrl !== undefined) {
    patch.image_url = imageUrl;
  }

  await Promise.all([
    updateDoc(doc(db, "courses", courseId), patch),
    saveCourseSchedule(
      courseId,
      input.scheduleSlots.map((s) => ({ ...s, courseId })),
    ),
  ]);

  return {
    id: courseId,
    title: trimmed,
    ...(imageUrl !== undefined ? { imageUrl } : {}),
  };
}
