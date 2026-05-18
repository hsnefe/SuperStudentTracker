/**
 * Course schedule persistence: Firestore when configured, else SQLite cache (native),
 * else in-memory map (web without Firebase).
 */
import { Platform } from "react-native";
import { getDoc, setDoc } from "firebase/firestore";
import type { ScheduleSlot } from "@/types";
import { readCache, writeCache } from "@/lib/sqliteCache";
import { userCourseScheduleDoc } from "@/lib/firestore/userPaths";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import { getScheduleMemory } from "./memoryCaches";

const CACHE_KEY_PREFIX = "course_schedule:";

function cacheKey(uid: string, courseId: string): string {
  return `${CACHE_KEY_PREFIX}${uid}:${courseId}`;
}

export async function loadCourseSchedule(
  uid: string,
  courseId: string,
): Promise<ScheduleSlot[] | null> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      const snap = await getDoc(userCourseScheduleDoc(db, uid, courseId));
      const slots = snap.data()?.slots as ScheduleSlot[] | undefined;
      if (!slots) return null;
      return slots;
    } catch {
      /* fall through to local */
    }
  }

  const fromSqlite = readCache<ScheduleSlot[]>(cacheKey(uid, courseId));
  if (fromSqlite != null) return fromSqlite;

  if (Platform.OS === "web") {
    const mem = getScheduleMemory().get(cacheKey(uid, courseId));
    return mem !== undefined ? (mem as ScheduleSlot[]) : null;
  }

  return null;
}

export async function saveCourseSchedule(
  uid: string,
  courseId: string,
  slots: ScheduleSlot[],
): Promise<void> {
  const withCourseId = slots.map((s) => ({ ...s, courseId }));

  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      await setDoc(userCourseScheduleDoc(db, uid, courseId), {
        slots: withCourseId,
        updatedAt: new Date().toISOString(),
      });
      return;
    } catch {
      /* fall through to local */
    }
  }

  const key = cacheKey(uid, courseId);
  writeCache(key, withCourseId);
  if (Platform.OS === "web") {
    getScheduleMemory().set(key, withCourseId);
  }
}
