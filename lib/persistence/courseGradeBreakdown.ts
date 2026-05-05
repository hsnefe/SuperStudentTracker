/**
 * Grade breakdown persistence: Supabase when configured, else SQLite cache (native),
 * else in-memory map (web without Supabase).
 *
 * Run in Supabase SQL editor before using cloud sync:
 *
 * ```sql
 * create table if not exists public.course_grade_breakdown_rows (
 *   id text primary key,
 *   course_id text not null,
 *   label text not null,
 *   weight_percent double precision not null,
 *   score_numeric double precision null,
 *   sort_order integer not null default 0,
 *   updated_at timestamptz not null default now()
 * );
 * create index if not exists course_grade_breakdown_rows_course_id_idx
 *   on public.course_grade_breakdown_rows (course_id);
 * ```
 */
import { Platform } from "react-native";
import type { CourseGradeBreakdownRow } from "@/types";
import { readCache, writeCache } from "@/lib/sqliteCache";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const CACHE_KEY_PREFIX = "course_grade_breakdown:";

const webMemory = new Map<string, CourseGradeBreakdownRow[]>();

function cacheKey(courseId: string): string {
  return `${CACHE_KEY_PREFIX}${courseId}`;
}

function rowFromDb(r: {
  id: string;
  label: string;
  weight_percent: number;
  score_numeric: number | null;
  sort_order: number;
}): CourseGradeBreakdownRow {
  return {
    id: r.id,
    label: r.label,
    weightPercent: r.weight_percent,
    scoreText: r.score_numeric == null ? "TBA" : String(r.score_numeric),
  };
}

export async function loadGradeBreakdown(courseId: string): Promise<CourseGradeBreakdownRow[] | null> {
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("course_grade_breakdown_rows")
        .select("id,label,weight_percent,score_numeric,sort_order")
        .eq("course_id", courseId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      if (!data?.length) return null;

      return data.map((row) =>
        rowFromDb({
          id: row.id as string,
          label: row.label as string,
          weight_percent: Number(row.weight_percent),
          score_numeric:
            row.score_numeric === null || row.score_numeric === undefined
              ? null
              : Number(row.score_numeric),
          sort_order: Number(row.sort_order),
        }),
      );
    } catch {
      /* fall through to local */
    }
  }

  const fromSqlite = readCache<CourseGradeBreakdownRow[]>(cacheKey(courseId));
  if (fromSqlite != null) return fromSqlite;

  if (Platform.OS === "web") {
    const mem = webMemory.get(courseId);
    return mem !== undefined ? mem : null;
  }

  return null;
}

export async function saveGradeBreakdown(courseId: string, rows: CourseGradeBreakdownRow[]): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase();
      const { error: delErr } = await sb.from("course_grade_breakdown_rows").delete().eq("course_id", courseId);
      if (delErr) throw delErr;

      const payload = rows.map((row, index) => {
        const raw =
          row.scoreText.trim().length === 0 || row.scoreText.trim().toUpperCase() === "TBA"
            ? null
            : Number.parseFloat(row.scoreText);
        const scoreNumeric = raw != null && Number.isFinite(raw) ? raw : null;
        return {
          id: row.id,
          course_id: courseId,
          label: row.label.trim(),
          weight_percent: row.weightPercent,
          score_numeric: scoreNumeric,
          sort_order: index,
        };
      });

      if (payload.length > 0) {
        const { error: insErr } = await sb.from("course_grade_breakdown_rows").insert(payload);
        if (insErr) throw insErr;
      }
      return;
    } catch {
      /* fall through to local */
    }
  }

  writeCache(cacheKey(courseId), rows);
  if (Platform.OS === "web") {
    webMemory.set(courseId, rows);
  }
}
