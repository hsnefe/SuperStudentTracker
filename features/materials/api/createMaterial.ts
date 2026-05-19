import { newMaterialId } from "@/lib/materialNormalize";
import { loadMaterials, saveMaterials } from "@/lib/persistence/courseMaterials";
import type { CourseMaterial, CourseMaterialKind, CreateMaterialInput } from "@/types";
import { inferMaterialKind } from "../lib/inferMaterialKind";
import { uploadCourseMaterial } from "./uploadCourseMaterial";
import { isFirebaseConfigured } from "@/lib/firebase";

export async function createMaterial(
  uid: string,
  input: CreateMaterialInput,
): Promise<CourseMaterial> {
  const materialId = newMaterialId();
  const title = input.title.trim();
  const createdAt = new Date().toISOString();

  let uri = input.uri?.trim() ?? "";
  let storagePath: string | undefined;
  let kind: CourseMaterialKind = input.localFileUri
    ? inferMaterialKind(input.fileName, input.mimeType)
    : "link";
  const fileName = input.fileName;
  const mimeType = input.mimeType;
  const sizeBytes = input.sizeBytes;

  if (input.localFileUri) {
    if (isFirebaseConfigured) {
      const uploaded = await uploadCourseMaterial(
        uid,
        input.courseId,
        materialId,
        input.localFileUri,
        fileName ?? "file",
        mimeType,
      );
      uri = uploaded.downloadUrl;
      storagePath = uploaded.storagePath;
    } else {
      uri = input.localFileUri;
    }
    kind = inferMaterialKind(fileName, mimeType);
  } else if (!uri) {
    throw new Error("A file or link URL is required");
  }

  const material: CourseMaterial = {
    id: materialId,
    courseId: input.courseId,
    title,
    kind,
    uri,
    createdAt,
    fileName,
    mimeType,
    sizeBytes,
    storagePath,
  };

  const existing = await loadMaterials(uid, input.courseId);
  await saveMaterials(uid, input.courseId, [...existing, material]);
  return material;
}
