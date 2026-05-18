import type { CourseGridItem } from "@/constants/coursesMock";
import { getDocs } from "firebase/firestore";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import {
  userCourseAssignmentsCollection,
  userCoursesCollection,
} from "@/lib/firestore/userPaths";
import type { Assignment } from "@/types";

type CourseRow = {
  id: string | number;
  title?: string | null;
  name?: string | null;
  image_url?: string | null;
  cover_url?: string | null;
};

export async function fetchCoursesGrid(uid: string): Promise<CourseGridItem[]> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }

  const db = getFirebaseFirestore();
  const [coursesSnap, assignmentsSnap] = await Promise.all([
    getDocs(userCoursesCollection(db, uid)),
    getDocs(userCourseAssignmentsCollection(db, uid)),
  ]);

  const courses = coursesSnap.docs.map((docSnap) => {
    const data = docSnap.data() as Omit<CourseRow, "id">;
    return { id: docSnap.id, ...data } as CourseRow;
  });

  const counts = new Map<string, number>();
  for (const docSnap of assignmentsSnap.docs) {
    const raw = docSnap.data()?.assignments;
    let list: Assignment[] = [];
    if (Array.isArray(raw)) {
      list = raw;
    } else if (typeof raw === "string") {
      try {
        list = JSON.parse(raw) as Assignment[];
      } catch {
        list = [];
      }
    }
    counts.set(docSnap.id, list.length);
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
