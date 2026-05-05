/**
 * Per-course assignment lists: Supabase when configured, else SQLite (native), else in-memory (web).
 *
 * ```sql
 * create table if not exists public.course_assignments_bundle (
 *   course_id text primary key,
 *   assignments_json jsonb not null,
 *   updated_at timestamptz not null default now()
 * );
 * ```
 */
import { Platform } from "react-native";
import type { Assignment } from "@/types";
import { MOCK_HOME_ASSIGNMENTS } from "@/constants/homeMock";
import { readCache, writeCache } from "@/lib/sqliteCache";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const CACHE_PREFIX = "course_assignments:";

const webMemory = new Map<string, Assignment[]>();

function cacheKey(courseId: string): string {
  return `${CACHE_PREFIX}${courseId}`;
}

export function mockAssignmentsForCourse(courseId: string): Assignment[] {
  return MOCK_HOME_ASSIGNMENTS.filter((a) => a.courseId === courseId);
}

export async function loadAssignments(courseId: string): Promise<Assignment[]> {
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("course_assignments_bundle")
        .select("assignments_json")
        .eq("course_id", courseId)
        .maybeSingle();

      if (error) throw error;
      const raw = data?.assignments_json;
      if (raw != null) {
        const parsed = typeof raw === "string" ? (JSON.parse(raw) as Assignment[]) : (raw as Assignment[]);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      /* fall through */
    }
  }

  const fromSqlite = readCache<Assignment[]>(cacheKey(courseId));
  if (fromSqlite != null) return fromSqlite;

  if (Platform.OS === "web") {
    const mem = webMemory.get(courseId);
    if (mem !== undefined) return mem;
  }

  return mockAssignmentsForCourse(courseId);
}

export async function saveAssignments(courseId: string, assignments: Assignment[]): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase();
      const { error } = await sb.from("course_assignments_bundle").upsert(
        {
          course_id: courseId,
          assignments_json: assignments,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "course_id" },
      );
      if (error) throw error;
      return;
    } catch {
      /* fall through */
    }
  }

  writeCache(cacheKey(courseId), assignments);
  if (Platform.OS === "web") {
    webMemory.set(courseId, assignments);
  }
}
