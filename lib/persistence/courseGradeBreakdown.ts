/**
 * Grade breakdown persistence: Firestore when configured, else SQLite cache (native),
 * else in-memory map (web without Firebase).
 */
import { Platform } from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { CourseGradeBreakdownRow } from "@/types";
import { readCache, writeCache } from "@/lib/sqliteCache";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";

const CACHE_KEY_PREFIX = "course_grade_breakdown:";

const webMemory = new Map<string, CourseGradeBreakdownRow[]>();

function cacheKey(courseId: string): string {
  return `${CACHE_KEY_PREFIX}${courseId}`;
}

export async function loadGradeBreakdown(courseId: string): Promise<CourseGradeBreakdownRow[] | null> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      const snap = await getDoc(doc(db, "courseGradeBreakdowns", courseId));
      const rows = snap.data()?.rows as CourseGradeBreakdownRow[] | undefined;
      if (!rows?.length) return null;
      return rows;
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
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      await setDoc(doc(db, "courseGradeBreakdowns", courseId), {
        rows,
        updatedAt: new Date().toISOString(),
      });
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
