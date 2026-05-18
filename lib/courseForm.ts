export function parseAbsenceHours(input: string): number | null {
  const trimmed = input.trim().replace(",", ".");
  if (!trimmed.length) return 0;
  const n = Number.parseFloat(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}
