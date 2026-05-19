import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorage, isFirebaseConfigured } from "@/lib/firebase";
import { safeStorageFileName } from "../lib/inferMaterialKind";

export function courseMaterialStoragePath(
  uid: string,
  courseId: string,
  materialId: string,
  fileName: string,
): string {
  return `courses/${uid}/${courseId}/materials/${materialId}/${safeStorageFileName(fileName)}`;
}

export type UploadCourseMaterialResult = {
  downloadUrl: string;
  storagePath: string;
};

export async function uploadCourseMaterial(
  uid: string,
  courseId: string,
  materialId: string,
  localUri: string,
  fileName: string,
  mimeType?: string,
): Promise<UploadCourseMaterialResult> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }

  const response = await fetch(localUri);
  const blob = await response.blob();
  const storage = getFirebaseStorage();
  const storagePath = courseMaterialStoragePath(uid, courseId, materialId, fileName);
  const objectRef = ref(storage, storagePath);
  await uploadBytes(objectRef, blob, mimeType ? { contentType: mimeType } : undefined);
  const downloadUrl = await getDownloadURL(objectRef);
  return { downloadUrl, storagePath };
}
