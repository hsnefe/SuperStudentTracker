import { loadMaterials, saveMaterials } from "@/lib/persistence/courseMaterials";
import type { CourseMaterial } from "@/types";
import { collectDescendantIds, isUserFolder } from "../lib/folderHelpers";
import { deleteCourseMaterialFile } from "./deleteCourseMaterialFile";

export async function deleteMaterial(
  uid: string,
  courseId: string,
  materialId: string,
): Promise<void> {
  const existing = await loadMaterials(uid, courseId);
  const target = existing.find((m) => m.id === materialId);
  if (!target) return;

  const idsToRemove = isUserFolder(target)
    ? collectDescendantIds(existing, materialId)
    : new Set([materialId]);

  for (const m of existing) {
    if (idsToRemove.has(m.id) && m.storagePath) {
      await deleteCourseMaterialFile(m.storagePath);
    }
  }

  const next = existing.filter((m) => !idsToRemove.has(m.id));
  await saveMaterials(uid, courseId, next);
}
