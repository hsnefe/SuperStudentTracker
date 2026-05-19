/**
 * Per-course absence records: Firestore when configured, else SQLite (native), else in-memory (web).
 */
import { Platform } from "react-native";
import { getDoc, setDoc } from "firebase/firestore";
import type { CourseAbsenceRecord } from "@/types";
import { readCache, writeCache } from "@/lib/sqliteCache";
import { userCourseAttendanceDoc } from "@/lib/firestore/userPaths";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import { getAttendanceMemory } from "./memoryCaches";

const CACHE_PREFIX = "course_attendance:";

function cacheKey(uid: string, courseId: string): string {
  return `${CACHE_PREFIX}${uid}:${courseId}`;
}

function normalizeRecords(raw: unknown, courseId: string): CourseAbsenceRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (r): r is CourseAbsenceRecord =>
        r != null &&
        typeof r === "object" &&
        typeof (r as CourseAbsenceRecord).id === "string" &&
        typeof (r as CourseAbsenceRecord).date === "string",
    )
    .map((r) => ({
      id: r.id,
      courseId: r.courseId ?? courseId,
      date: r.date,
    }));
}

export async function loadCourseAttendance(
  uid: string,
  courseId: string,
): Promise<CourseAbsenceRecord[]> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      const snap = await getDoc(userCourseAttendanceDoc(db, uid, courseId));
      const raw = snap.data()?.records;
      if (raw != null) {
        return normalizeRecords(raw, courseId);
      }
    } catch {
      /* fall through */
    }
  }

  const fromSqlite = readCache<CourseAbsenceRecord[]>(cacheKey(uid, courseId));
  if (fromSqlite != null) return normalizeRecords(fromSqlite, courseId);

  if (Platform.OS === "web") {
    const mem = getAttendanceMemory().get(cacheKey(uid, courseId));
    if (mem !== undefined) return normalizeRecords(mem, courseId);
  }

  return [];
}

export async function saveCourseAttendance(
  uid: string,
  courseId: string,
  records: CourseAbsenceRecord[],
): Promise<void> {
  const withCourseId = records.map((r) => ({ ...r, courseId }));

  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      await setDoc(userCourseAttendanceDoc(db, uid, courseId), {
        records: withCourseId,
        updatedAt: new Date().toISOString(),
      });
      return;
    } catch {
      /* fall through */
    }
  }

  const key = cacheKey(uid, courseId);
  writeCache(key, withCourseId);
  if (Platform.OS === "web") {
    getAttendanceMemory().set(key, withCourseId);
  }
}
