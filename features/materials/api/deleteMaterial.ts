import { loadMaterials, saveMaterials } from "@/lib/persistence/courseMaterials";
import { deleteCourseMaterialFile } from "./deleteCourseMaterialFile";

export async function deleteMaterial(
  uid: string,
  courseId: string,
  materialId: string,
): Promise<void> {
  const existing = await loadMaterials(uid, courseId);
  const target = existing.find((m) => m.id === materialId);
  if (target?.storagePath) {
    await deleteCourseMaterialFile(target.storagePath);
  }
  const next = existing.filter((m) => m.id !== materialId);
  await saveMaterials(uid, courseId, next);
}
