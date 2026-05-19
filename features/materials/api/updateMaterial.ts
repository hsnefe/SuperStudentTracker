import { loadMaterials, saveMaterials } from "@/lib/persistence/courseMaterials";
import type { CourseMaterial } from "@/types";
import { findMaterial } from "../lib/folderHelpers";

export async function updateMaterialTitle(
  uid: string,
  courseId: string,
  materialId: string,
  title: string,
): Promise<CourseMaterial> {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Title is required");

  const existing = await loadMaterials(uid, courseId);
  const target = findMaterial(existing, materialId);
  if (!target) throw new Error("Material not found");

  const updated: CourseMaterial = { ...target, title: trimmed };
  const next = existing.map((m) => (m.id === materialId ? updated : m));
  await saveMaterials(uid, courseId, next);
  return updated;
}
