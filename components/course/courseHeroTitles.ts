/** Split course title into two hero lines (reference: diagonal headlines). */
export function splitCourseHeroTitle(title: string): { line1: string; line2: string } {
  const t = title.trim();
  if (!t.length) return { line1: "COURSE", line2: "" };
  const idx = t.indexOf(" ");
  if (idx > 0) {
    return {
      line1: t.slice(0, idx).toUpperCase(),
      line2: t.slice(idx + 1).toUpperCase(),
    };
  }
  const mid = Math.ceil(t.length / 2);
  return {
    line1: t.slice(0, mid).toUpperCase(),
    line2: t.slice(mid).toUpperCase(),
  };
}
