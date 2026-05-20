import { File } from "expo-file-system";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Platform } from "react-native";
import { getFirebaseStorage, isFirebaseConfigured } from "@/lib/firebase";
import { safeStorageFileName } from "../lib/inferMaterialKind";

const UPLOAD_TIMEOUT_MS = 120_000;

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

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

async function uriToBlob(localUri: string, mimeType?: string): Promise<Blob> {
  const useFetch =
    Platform.OS === "web" ||
    localUri.startsWith("blob:") ||
    localUri.startsWith("http://") ||
    localUri.startsWith("https://");

  if (useFetch) {
    const response = await fetch(localUri);
    if (!response.ok) {
      throw new Error(`Could not read the selected file (${response.status}).`);
    }
    return response.blob();
  }

  try {
    const file = new File(localUri);
    const bytes = await file.bytes();
    return new Blob([bytes], { type: mimeType ?? "application/octet-stream" });
  } catch {
    const response = await fetch(localUri);
    if (!response.ok) {
      throw new Error("Could not read the selected file.");
    }
    return response.blob();
  }
}

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

  const upload = async () => {
    const blob = await uriToBlob(localUri, mimeType);
    if (blob.size === 0) {
      throw new Error("Selected file is empty.");
    }

    const storage = getFirebaseStorage();
    const storagePath = courseMaterialStoragePath(uid, courseId, materialId, fileName);
    const objectRef = ref(storage, storagePath);
    await uploadBytes(objectRef, blob, mimeType ? { contentType: mimeType } : undefined);
    const downloadUrl = await getDownloadURL(objectRef);
    return { downloadUrl, storagePath };
  };

  try {
    return await withTimeout(
      upload(),
      UPLOAD_TIMEOUT_MS,
      "Upload timed out. Check your connection and Firebase Storage rules.",
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    if (/unauthorized|permission|403/i.test(message)) {
      throw new Error(
        "Storage permission denied. Deploy storage.rules and sign in with the correct account.",
      );
    }
    throw err instanceof Error ? err : new Error(message);
  }
}
