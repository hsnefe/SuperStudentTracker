import type { CourseGridItem } from "@/constants/coursesMock";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";

type CourseRow = {
  id: string | number;
  title?: string | null;
  name?: string | null;
  image_url?: string | null;
  cover_url?: string | null;
};

type AssignmentRow = {
  course_id?: string | number | null;
};

/**
 * Loads courses and computes assignment counts per course.
 * Expects tables `courses` and `assignments` with `assignments.course_id` → `courses.id`.
 * Adjust column names here when your schema is finalized.
 */
export async function fetchCoursesGrid(): Promise<CourseGridItem[]> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }

  const db = getFirebaseFirestore();
  const [coursesSnap, assignmentsSnap] = await Promise.all([
    getDocs(collection(db, "courses")),
    getDocs(collection(db, "assignments")),
  ]);

  const courses = coursesSnap.docs.map((docSnap) => {
    const data = docSnap.data() as Omit<CourseRow, "id">;
    return { id: docSnap.id, ...data } as CourseRow;
  });
  const assignments = assignmentsSnap.docs.map((docSnap) => docSnap.data() as AssignmentRow);

  const counts = new Map<string, number>();
  for (const row of assignments) {
    const cid = row.course_id;
    if (cid === undefined || cid === null) continue;
    const key = String(cid);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return courses.map((c) => {
    const id = String(c.id);
    const title = (c.title ?? c.name ?? "Untitled course").trim() || "Untitled course";
    const imageUrl = c.image_url ?? c.cover_url ?? null;
    return {
      id,
      title,
      imageUrl,
      assignmentCount: counts.get(id) ?? 0,
    };
  });
}
