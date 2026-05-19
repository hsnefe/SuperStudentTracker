import type { CourseMaterial, CourseMaterialKind } from "@/types";

const VALID_KINDS: CourseMaterialKind[] = [
  "folder",
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

function normalizeParentFolderId(raw: unknown): string | null | undefined {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "string" && raw.length > 0) return raw;
  return undefined;
}

export function normalizeMaterial(raw: unknown): CourseMaterial | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : "";
  const courseId = typeof o.courseId === "string" ? o.courseId : "";
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const kind = normalizeKind(o.kind);
  const uri = typeof o.uri === "string" ? o.uri : "";
  if (!id || !courseId || !title) return null;
  const isFolder = kind === "folder";
  if (!isFolder && !uri) return null;

  const createdAt =
    typeof o.createdAt === "string" && o.createdAt.length > 0
      ? o.createdAt
      : new Date().toISOString();

  const parentFolderId = normalizeParentFolderId(o.parentFolderId);

  return {
    id,
    courseId,
    title,
    kind,
    uri: isFolder ? uri || "folder://" : uri,
    createdAt,
    ...(typeof o.fileName === "string" ? { fileName: o.fileName } : {}),
    ...(typeof o.mimeType === "string" ? { mimeType: o.mimeType } : {}),
    ...(typeof o.sizeBytes === "number" ? { sizeBytes: o.sizeBytes } : {}),
    ...(typeof o.storagePath === "string" ? { storagePath: o.storagePath } : {}),
    ...(parentFolderId != null ? { parentFolderId } : {}),
  };
}

/** Firestore rejects undefined field values — strip them before setDoc. */
export function serializeMaterialsForFirestore(
  materials: CourseMaterial[],
): Record<string, unknown>[] {
  return materials.map((m) => {
    const row: Record<string, unknown> = {
      id: m.id,
      courseId: m.courseId,
      title: m.title,
      kind: m.kind,
      uri: m.kind === "folder" ? m.uri || "folder://" : m.uri,
      createdAt: m.createdAt,
    };
    if (m.fileName != null) row.fileName = m.fileName;
    if (m.mimeType != null) row.mimeType = m.mimeType;
    if (m.sizeBytes != null) row.sizeBytes = m.sizeBytes;
    if (m.storagePath != null) row.storagePath = m.storagePath;
    if (m.parentFolderId != null && m.parentFolderId !== "") {
      row.parentFolderId = m.parentFolderId;
    }
    return row;
  });
}

export function normalizeMaterials(raw: unknown): CourseMaterial[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeMaterial)
    .filter((m): m is CourseMaterial => m != null);
}
