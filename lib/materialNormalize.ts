import type { CourseMaterial, CourseMaterialKind } from "@/types";

const VALID_KINDS: CourseMaterialKind[] = [
  "pdf",
  "slides",
  "link",
  "image",
  "document",
  "other",
];

export function newMaterialId(): string {
  return `mat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeKind(raw: unknown): CourseMaterialKind {
  if (typeof raw === "string" && (VALID_KINDS as string[]).includes(raw)) {
    return raw as CourseMaterialKind;
  }
  return "other";
}

export function normalizeMaterial(raw: unknown): CourseMaterial | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const courseId = typeof o.courseId === "string" ? o.courseId : "";
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const uri = typeof o.uri === "string" ? o.uri : "";
  if (!id || !courseId || !title || !uri) return null;

  const createdAt =
    typeof o.createdAt === "string" && o.createdAt.length > 0
      ? o.createdAt
      : new Date().toISOString();

  return {
    id,
    courseId,
    title,
    kind: normalizeKind(o.kind),
    uri,
    createdAt,
    fileName: typeof o.fileName === "string" ? o.fileName : undefined,
    mimeType: typeof o.mimeType === "string" ? o.mimeType : undefined,
    sizeBytes: typeof o.sizeBytes === "number" ? o.sizeBytes : undefined,
    storagePath: typeof o.storagePath === "string" ? o.storagePath : undefined,
  };
}

export function normalizeMaterials(raw: unknown): CourseMaterial[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeMaterial)
    .filter((m): m is CourseMaterial => m != null);
}
