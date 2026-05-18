import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseStorage, isFirebaseConfigured } from "@/lib/firebase";

export function courseCoverStoragePath(courseId: string): string {
  return `courses/${courseId}/cover.jpg`;
}

export async function uploadCourseCoverImage(
  courseId: string,
  localUri: string,
): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }

  const response = await fetch(localUri);
  const blob = await response.blob();
  const storage = getFirebaseStorage();
  const objectRef = ref(storage, courseCoverStoragePath(courseId));
  await uploadBytes(objectRef, blob, { contentType: "image/jpeg" });
  return getDownloadURL(objectRef);
}

export async function deleteCourseCoverImage(courseId: string): Promise<void> {
  if (!isFirebaseConfigured) return;

  try {
    const storage = getFirebaseStorage();
    const objectRef = ref(storage, courseCoverStoragePath(courseId));
    await deleteObject(objectRef);
  } catch {
    /* object may not exist */
  }
}
