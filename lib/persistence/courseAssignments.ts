/**
 * Per-course assignment lists: Firestore when configured, else SQLite (native), else in-memory (web).
 */
import { Platform } from "react-native";
import { getDoc, setDoc } from "firebase/firestore";
import { normalizeAssignments } from "@/lib/assignmentNormalize";
import { MOCK_HOME_ASSIGNMENTS } from "@/constants/homeMock";
import type { Assignment } from "@/types";
import { readCache, writeCache } from "@/lib/sqliteCache";
import { userCourseAssignmentDoc } from "@/lib/firestore/userPaths";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import { getAssignmentMemory } from "./memoryCaches";

const CACHE_PREFIX = "course_assignments:";

function cacheKey(uid: string, courseId: string): string {
  return `${CACHE_PREFIX}${uid}:${courseId}`;
}

export function mockAssignmentsForCourse(courseId: string): Assignment[] {
  return MOCK_HOME_ASSIGNMENTS.filter((a) => a.courseId === courseId);
}

export async function loadAssignments(uid: string, courseId: string): Promise<Assignment[]> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      const snap = await getDoc(userCourseAssignmentDoc(db, uid, courseId));
      const raw = snap.data()?.assignments;
      if (raw != null) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) return normalizeAssignments(parsed);
      }
    } catch {
      /* fall through */
    }
  }

  const fromSqlite = readCache<Assignment[]>(cacheKey(uid, courseId));
  if (fromSqlite != null) return normalizeAssignments(fromSqlite);

  if (Platform.OS === "web") {
    const mem = getAssignmentMemory().get(cacheKey(uid, courseId));
    if (mem !== undefined) return normalizeAssignments(mem as Assignment[]);
  }

  return mockAssignmentsForCourse(courseId);
}

export async function saveAssignments(
  uid: string,
  courseId: string,
  assignments: Assignment[],
): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      await setDoc(userCourseAssignmentDoc(db, uid, courseId), {
        assignments,
        updatedAt: new Date().toISOString(),
      });
      return;
    } catch {
      /* fall through */
    }
  }

  const key = cacheKey(uid, courseId);
  writeCache(key, assignments);
  if (Platform.OS === "web") {
    getAssignmentMemory().set(key, assignments);
  }
}
