import type { CourseGridItem } from "@/constants/coursesMock";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

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
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const supabase = getSupabase();

  const { data: coursesRaw, error: coursesError } = await supabase
    .from("courses")
    .select("id, title, name, image_url, cover_url");

  if (coursesError) {
    throw coursesError;
  }

  const { data: assignmentsRaw, error: assignmentsError } = await supabase
    .from("assignments")
    .select("course_id");

  if (assignmentsError) {
    throw assignmentsError;
  }

  const courses = (coursesRaw ?? []) as CourseRow[];
  const assignments = (assignmentsRaw ?? []) as AssignmentRow[];

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
