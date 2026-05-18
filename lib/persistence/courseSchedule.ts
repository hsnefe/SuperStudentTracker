/**
 * Course schedule persistence: Firestore when configured, else SQLite cache (native),
 * else in-memory map (web without Firebase).
 */
import { Platform } from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { ScheduleSlot } from "@/types";
import { readCache, writeCache } from "@/lib/sqliteCache";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";

const CACHE_KEY_PREFIX = "course_schedule:";

const webMemory = new Map<string, ScheduleSlot[]>();

function cacheKey(courseId: string): string {
  return `${CACHE_KEY_PREFIX}${courseId}`;
}

export async function loadCourseSchedule(courseId: string): Promise<ScheduleSlot[] | null> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      const snap = await getDoc(doc(db, "courseSchedules", courseId));
      const slots = snap.data()?.slots as ScheduleSlot[] | undefined;
      if (!slots) return null;
      return slots;
    } catch {
      /* fall through to local */
    }
  }

  const fromSqlite = readCache<ScheduleSlot[]>(cacheKey(courseId));
  if (fromSqlite != null) return fromSqlite;

  if (Platform.OS === "web") {
    const mem = webMemory.get(courseId);
    return mem !== undefined ? mem : null;
  }

  return null;
}

export async function saveCourseSchedule(courseId: string, slots: ScheduleSlot[]): Promise<void> {
  const withCourseId = slots.map((s) => ({ ...s, courseId }));

  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      await setDoc(doc(db, "courseSchedules", courseId), {
        slots: withCourseId,
        updatedAt: new Date().toISOString(),
      });
      return;
    } catch {
      /* fall through to local */
    }
  }

  writeCache(cacheKey(courseId), withCourseId);
  if (Platform.OS === "web") {
    webMemory.set(courseId, withCourseId);
  }
}
