/**
 * Per-course material lists: Firestore when configured, else SQLite (native), else in-memory (web).
 */
import { Platform } from "react-native";
import { getDoc, setDoc } from "firebase/firestore";
import { normalizeMaterials, serializeMaterialsForFirestore } from "@/lib/materialNormalize";
import { readCache, writeCache } from "@/lib/sqliteCache";
import { userCourseMaterialDoc } from "@/lib/firestore/userPaths";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import { getMaterialsMemory } from "./memoryCaches";
import type { CourseMaterial } from "@/types";

const CACHE_PREFIX = "course_materials:";

function cacheKey(uid: string, courseId: string): string {
  return `${CACHE_PREFIX}${uid}:${courseId}`;
}

function writeLocalCache(uid: string, courseId: string, materials: CourseMaterial[]): void {
  const key = cacheKey(uid, courseId);
  writeCache(key, materials);
  if (Platform.OS === "web") {
    getMaterialsMemory().set(key, materials);
  }
}

export async function loadMaterials(uid: string, courseId: string): Promise<CourseMaterial[]> {
  if (isFirebaseConfigured) {
    try {
      const db = getFirebaseFirestore();
      const snap = await getDoc(userCourseMaterialDoc(db, uid, courseId));
      const raw = snap.data()?.materials;
      if (raw != null) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) {
          const normalized = normalizeMaterials(parsed);
          writeLocalCache(uid, courseId, normalized);
          return normalized;
        }
      }
    } catch (err) {
      console.warn("[courseMaterials] Firestore load failed, using cache", err);
    }
  }

  const fromSqlite = readCache<CourseMaterial[]>(cacheKey(uid, courseId));
  if (fromSqlite != null) return normalizeMaterials(fromSqlite);

  if (Platform.OS === "web") {
    const mem = getMaterialsMemory().get(cacheKey(uid, courseId));
    if (mem !== undefined) return normalizeMaterials(mem as CourseMaterial[]);
  }

  return [];
}

export async function saveMaterials(
  uid: string,
  courseId: string,
  materials: CourseMaterial[],
): Promise<void> {
  const normalized = normalizeMaterials(materials);

  if (isFirebaseConfigured) {
    const db = getFirebaseFirestore();
    try {
      await setDoc(userCourseMaterialDoc(db, uid, courseId), {
        materials: serializeMaterialsForFirestore(normalized),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save materials to Firestore";
      throw new Error(message);
    }
  }

  writeLocalCache(uid, courseId, normalized);
}
