import type { CourseMaterialKind } from "@/types";

const SLIDE_EXTENSIONS = new Set(["ppt", "pptx", "key", "odp"]);
const PDF_EXTENSIONS = new Set(["pdf"]);
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "heic", "bmp", "svg"]);
const DOCUMENT_EXTENSIONS = new Set([
  "doc",
  "docx",
  "txt",
  "rtf",
  "odt",
  "xls",
  "xlsx",
  "csv",
  "md",
]);

function extensionFromName(name: string): string {
  const base = name.split(/[?#]/)[0] ?? name;
  const idx = base.lastIndexOf(".");
  if (idx < 0) return "";
  return base.slice(idx + 1).toLowerCase();
}

export function inferMaterialKind(fileName?: string, mimeType?: string): CourseMaterialKind {
  const ext = fileName ? extensionFromName(fileName) : "";
  const mime = (mimeType ?? "").toLowerCase();

  if (mime.includes("pdf") || PDF_EXTENSIONS.has(ext)) return "pdf";
  if (
    mime.includes("presentation") ||
    mime.includes("powerpoint") ||
    SLIDE_EXTENSIONS.has(ext)
  ) {
    return "slides";
  }
  if (mime.startsWith("image/") || IMAGE_EXTENSIONS.has(ext)) return "image";
  if (
    mime.includes("word") ||
    mime.includes("text") ||
    mime.includes("spreadsheet") ||
    DOCUMENT_EXTENSIONS.has(ext)
  ) {
    return "document";
  }
  return "other";
}

export function safeStorageFileName(fileName: string): string {
  const trimmed = fileName.trim() || "file";
  return trimmed.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}
