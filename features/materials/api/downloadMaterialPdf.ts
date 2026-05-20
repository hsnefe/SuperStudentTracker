import { File, Paths } from "expo-file-system";
import { getBytes, ref } from "firebase/storage";
import { getFirebaseAuth, getFirebaseStorage, isFirebaseConfigured } from "@/lib/firebase";
import type { CourseMaterial } from "@/types";
import { exceedsPdfSizeLimit, isLocalOnlyMaterial, MAX_PDF_BYTES } from "../lib/materialPdfGuards";

export type DownloadMaterialPdfOptions = {
  signal?: AbortSignal;
  onProgress?: (loaded: number, total: number) => void;
  /** When true, skips the 5 MB metadata guard (user confirmed). */
  allowOversize?: boolean;
};

export type DownloadMaterialPdfResult = {
  localUri: string;
  sizeBytes: number;
};

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Download cancelled", "AbortError");
  }
}

function storageRefForMaterial(material: CourseMaterial) {
  if (!material.storagePath) {
    throw new Error("Material has no storage path.");
  }
  return ref(getFirebaseStorage(), material.storagePath);
}

async function downloadViaFetch(
  material: CourseMaterial,
  options: DownloadMaterialPdfOptions,
): Promise<Uint8Array> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new Error("Sign in to download this PDF.");
  }

  const token = await user.getIdToken();
  throwIfAborted(options.signal);

  const response = await fetch(material.uri, {
    signal: options.signal,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Download failed (${response.status}).`);
  }

  const totalHeader = response.headers.get("content-length");
  const total =
    totalHeader != null
      ? Number(totalHeader)
      : material.sizeBytes ?? 0;

  if (!options.allowOversize && total > MAX_PDF_BYTES) {
    throw new Error("PDF exceeds the 5 MB limit.");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    const buffer = new Uint8Array(await response.arrayBuffer());
    options.onProgress?.(buffer.byteLength, buffer.byteLength || total);
    if (!options.allowOversize && buffer.byteLength > MAX_PDF_BYTES) {
      throw new Error("PDF exceeds the 5 MB limit.");
    }
    return buffer;
  }

  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    throwIfAborted(options.signal);
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    if (!options.allowOversize && loaded > MAX_PDF_BYTES) {
      reader.cancel().catch(() => {});
      throw new Error("PDF exceeds the 5 MB limit.");
    }
    options.onProgress?.(loaded, total || loaded);
  }

  const merged = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}

async function downloadViaStorageSdk(
  material: CourseMaterial,
  options: DownloadMaterialPdfOptions,
): Promise<Uint8Array> {
  throwIfAborted(options.signal);
  const storageRef = storageRefForMaterial(material);
  const maxSize = options.allowOversize ? MAX_PDF_BYTES * 4 : MAX_PDF_BYTES + 1;
  const raw = await getBytes(storageRef, maxSize);
  const bytes = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  throwIfAborted(options.signal);

  if (!options.allowOversize && bytes.byteLength > MAX_PDF_BYTES) {
    throw new Error("PDF exceeds the 5 MB limit.");
  }

  options.onProgress?.(bytes.byteLength, bytes.byteLength);
  return bytes;
}

export async function downloadMaterialPdf(
  material: CourseMaterial,
  options: DownloadMaterialPdfOptions = {},
): Promise<DownloadMaterialPdfResult> {
  if (material.kind !== "pdf") {
    throw new Error("Not a PDF material.");
  }
  if (isLocalOnlyMaterial(material)) {
    throw new Error("Upload this PDF to the cloud before viewing in the app.");
  }
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured.");
  }
  if (!getFirebaseAuth().currentUser) {
    throw new Error("Sign in to view this PDF.");
  }
  if (!options.allowOversize && exceedsPdfSizeLimit(material.sizeBytes)) {
    throw new Error("PDF exceeds the 5 MB limit.");
  }

  let bytes: Uint8Array;
  if (material.storagePath) {
    try {
      bytes = await downloadViaStorageSdk(material, options);
    } catch {
      bytes = await downloadViaFetch(material, options);
    }
  } else {
    bytes = await downloadViaFetch(material, options);
  }

  throwIfAborted(options.signal);

  const safeName = (material.fileName ?? material.id).replace(/[^\w.-]+/g, "_");
  const cacheFile = new File(Paths.cache, `pdf-${material.id}-${safeName}.pdf`);
  if (cacheFile.exists) {
    cacheFile.delete();
  }
  cacheFile.create();
  cacheFile.write(bytes);

  return {
    localUri: cacheFile.uri,
    sizeBytes: bytes.byteLength,
  };
}
