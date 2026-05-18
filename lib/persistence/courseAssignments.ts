/**
 * Per-course assignment lists: Firestore when configured, else SQLite (native), else in-memory (web).
 */
import { Platform } from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { normalizeAssignments } from "@/lib/assignmentNormalize";
import { MOCK_HOME_ASSIGNMENTS } from "@/constants/homeMock";
import type { Assignment } from "@/types";
import { readCache, writeCache } from "@/lib/sqliteCache";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";

const CACHE_PREFIX = "course_assignments:";

const webMemory = new Map<string, Assignment[]>();

function cacheKey(courseId: string): string {
  return `${CACHE_PREFIX}${courseId}`;
}

export function mockAssignmentsForCourse(courseId: string): Assignment[] {
  return MOCK_HOME_ASSIGNMENTS.filter((a) => a.courseId === courseId);
}

export async function loadAssignments(courseId: string): Promise<Assignment[]> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      const snap = await getDoc(doc(db, "courseAssignments", courseId));
      const raw = snap.data()?.assignments;
      if (raw != null) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) return normalizeAssignments(parsed);
      }
    } catch {
      /* fall through */
    }
  }

  const fromSqlite = readCache<Assignment[]>(cacheKey(courseId));
  if (fromSqlite != null) return normalizeAssignments(fromSqlite);

  if (Platform.OS === "web") {
    const mem = webMemory.get(courseId);
    if (mem !== undefined) return normalizeAssignments(mem);
  }

  return mockAssignmentsForCourse(courseId);
}

export async function saveAssignments(courseId: string, assignments: Assignment[]): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      await setDoc(doc(db, "courseAssignments", courseId), {
        assignments,
        updatedAt: new Date().toISOString(),
      });
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
