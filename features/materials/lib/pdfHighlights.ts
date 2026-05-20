import { readCache, writeCache } from "@/lib/sqliteCache";

export type PdfHighlightRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PdfHighlight = {
  id: string;
  page: number;
  rects: PdfHighlightRect[];
};

function cacheKey(materialId: string): string {
  return `pdf_highlights_${materialId}`;
}

export function loadPdfHighlights(materialId: string): PdfHighlight[] {
  return readCache<PdfHighlight[]>(cacheKey(materialId)) ?? [];
}

export function savePdfHighlights(materialId: string, highlights: PdfHighlight[]): void {
  writeCache(cacheKey(materialId), highlights);
}
