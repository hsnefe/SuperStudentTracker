import { deleteObject, ref } from "firebase/storage";
import { getFirebaseStorage, isFirebaseConfigured } from "@/lib/firebase";

export async function deleteCourseMaterialFile(storagePath: string): Promise<void> {
  if (!isFirebaseConfigured || !storagePath) return;

  try {
    const storage = getFirebaseStorage();
    const objectRef = ref(storage, storagePath);
    await deleteObject(objectRef);
  } catch {
    /* object may not exist */
  }
}
