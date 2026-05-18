import type { CourseGradeBreakdownRow } from "@/types";

export const WEIGHT_EPS = 0.01;

export function newGradeRowId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function weightsSum(rows: CourseGradeBreakdownRow[]): number {
  return rows.reduce((acc, r) => acc + (Number.isFinite(r.weightPercent) ? r.weightPercent : 0), 0);
}

export function weightsValid(rows: CourseGradeBreakdownRow[]): boolean {
  return Math.abs(weightsSum(rows) - 100) <= WEIGHT_EPS;
}

export type GradeBreakdownDraftRow = {
  id: string;
  label: string;
  weightInput: string;
  scoreInput: string;
};

export function toGradeDraft(row: CourseGradeBreakdownRow): GradeBreakdownDraftRow {
  const score =
    row.scoreText.trim().toUpperCase() === "TBA" ? "" : row.scoreText.trim();
  return {
    id: row.id,
    label: row.label,
    weightInput: String(row.weightPercent),
    scoreInput: score,
  };
}

export function fromGradeDraft(d: GradeBreakdownDraftRow): CourseGradeBreakdownRow | null {
  const label = d.label.trim();
  const w = Number.parseFloat(d.weightInput.replace(",", "."));
  if (!label.length || !Number.isFinite(w)) return null;
  const scoreRaw = d.scoreInput.trim();
  if (scoreRaw.length === 0) {
    return { id: d.id, label, weightPercent: w, scoreText: "TBA" };
  }
  const scoreNum = Number.parseFloat(scoreRaw.replace(",", "."));
  if (!Number.isFinite(scoreNum)) return null;
  return { id: d.id, label, weightPercent: w, scoreText: String(scoreNum) };
}

export function parseGradeDrafts(drafts: GradeBreakdownDraftRow[]): CourseGradeBreakdownRow[] | null {
  const out: CourseGradeBreakdownRow[] = [];
  for (const d of drafts) {
    const row = fromGradeDraft(d);
    if (!row) return null;
    out.push(row);
  }
  return out;
}

export function formatGradePct(w: number): string {
  if (Number.isInteger(w)) return `%${w}`;
  return `%${w}`;
}
