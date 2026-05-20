import type { CourseMaterial } from "@/types";

export const MAX_PDF_BYTES = 5 * 1024 * 1024;

export function isLocalOnlyMaterial(material: CourseMaterial): boolean {
  if (material.storagePath) return false;
  const uri = material.uri.trim();
  return (
    uri.startsWith("file:") ||
    uri.startsWith("content:") ||
    uri.startsWith("ph://") ||
    uri.startsWith("assets-library:")
  );
}

export function exceedsPdfSizeLimit(sizeBytes?: number): boolean {
  return typeof sizeBytes === "number" && sizeBytes > MAX_PDF_BYTES;
}
