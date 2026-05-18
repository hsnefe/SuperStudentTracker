/**
 * Grade breakdown persistence: Firestore when configured, else SQLite cache (native),
 * else in-memory map (web without Firebase).
 */
import { Platform } from "react-native";
import { getDoc, setDoc } from "firebase/firestore";
import type { CourseGradeBreakdownRow } from "@/types";
import { readCache, writeCache } from "@/lib/sqliteCache";
import { userCourseGradeBreakdownDoc } from "@/lib/firestore/userPaths";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import { getGradeMemory } from "./memoryCaches";

const CACHE_KEY_PREFIX = "course_grade_breakdown:";

function cacheKey(uid: string, courseId: string): string {
  return `${CACHE_KEY_PREFIX}${uid}:${courseId}`;
}

export async function loadGradeBreakdown(
  uid: string,
  courseId: string,
): Promise<CourseGradeBreakdownRow[] | null> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      const snap = await getDoc(userCourseGradeBreakdownDoc(db, uid, courseId));
      const rows = snap.data()?.rows as CourseGradeBreakdownRow[] | undefined;
      if (!rows?.length) return null;
      return rows;
    } catch {
      /* fall through to local */
    }
  }

  const fromSqlite = readCache<CourseGradeBreakdownRow[]>(cacheKey(uid, courseId));
  if (fromSqlite != null) return fromSqlite;

  if (Platform.OS === "web") {
    const mem = getGradeMemory().get(cacheKey(uid, courseId));
    return mem !== undefined ? (mem as CourseGradeBreakdownRow[]) : null;
  }

  return null;
}

export async function saveGradeBreakdown(
  uid: string,
  courseId: string,
  rows: CourseGradeBreakdownRow[],
): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      await setDoc(userCourseGradeBreakdownDoc(db, uid, courseId), {
        rows,
        updatedAt: new Date().toISOString(),
      });
      return;
    } catch {
      /* fall through to local */
    }
  }

  const key = cacheKey(uid, courseId);
  writeCache(key, rows);
  if (Platform.OS === "web") {
    getGradeMemory().set(key, rows);
  }
}
