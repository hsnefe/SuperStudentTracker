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
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(cacheKey(materialId));
    return raw ? (JSON.parse(raw) as PdfHighlight[]) : [];
  } catch {
    return [];
  }
}

export function savePdfHighlights(materialId: string, highlights: PdfHighlight[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(cacheKey(materialId), JSON.stringify(highlights));
}
