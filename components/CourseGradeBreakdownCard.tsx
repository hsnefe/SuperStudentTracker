import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { loadGradeBreakdown, saveGradeBreakdown } from "@/lib/persistence/courseGradeBreakdown";
import { useTheme } from "@/hooks";
import type { CourseGradeBreakdownRow } from "@/types";

const WEIGHT_EPS = 0.01;

/** UUID v4-shaped id for stable local and cloud row identities. */
function newRowId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function weightsSum(rows: CourseGradeBreakdownRow[]): number {
  return rows.reduce((acc, r) => acc + (Number.isFinite(r.weightPercent) ? r.weightPercent : 0), 0);
}

function weightsValid(rows: CourseGradeBreakdownRow[]): boolean {
  return Math.abs(weightsSum(rows) - 100) <= WEIGHT_EPS;
}

type DraftRow = {
  id: string;
  label: string;
  weightInput: string;
  scoreInput: string;
};

function toDraft(row: CourseGradeBreakdownRow): DraftRow {
  const score =
    row.scoreText.trim().toUpperCase() === "TBA" ? "" : row.scoreText.trim();
  return {
    id: row.id,
    label: row.label,
    weightInput: String(row.weightPercent),
    scoreInput: score,
  };
}

function fromDraft(d: DraftRow): CourseGradeBreakdownRow | null {
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

type Props = {
  courseId: string;
  initialRows: CourseGradeBreakdownRow[];
};

export function CourseGradeBreakdownCard({ courseId, initialRows }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const [savedRows, setSavedRows] = useState<CourseGradeBreakdownRow[]>(initialRows);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftRows, setDraftRows] = useState<DraftRow[]>(() => initialRows.map(toDraft));
  const [weightError, setWeightError] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const snapshotBeforeEdit = useRef<CourseGradeBreakdownRow[]>(initialRows);
  const editingRef = useRef(editing);
  editingRef.current = editing;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const loaded = await loadGradeBreakdown(courseId);
      if (cancelled) return;
      const next = loaded ?? initialRows;
      setSavedRows(next);
      setDraftRows((draft) => (editingRef.current ? draft : next.map(toDraft)));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, initialRows]);

  const enterEdit = useCallback(() => {
    snapshotBeforeEdit.current = [...savedRows];
    setDraftRows(savedRows.map(toDraft));
    setWeightError(false);
    setEditing(true);
  }, [savedRows]);

  const cancelEdit = useCallback(() => {
    const snap = snapshotBeforeEdit.current;
    setSavedRows(snap);
    setDraftRows(snap.map(toDraft));
    setWeightError(false);
    setEditing(false);
  }, []);

  const parsedDraftRows = useMemo((): CourseGradeBreakdownRow[] | null => {
    const out: CourseGradeBreakdownRow[] = [];
    for (const d of draftRows) {
      const row = fromDraft(d);
      if (!row) return null;
      out.push(row);
    }
    return out;
  }, [draftRows]);

  const canSave =
    parsedDraftRows !== null && weightsValid(parsedDraftRows) && draftRows.length > 0;

  const save = useCallback(async () => {
    if (!parsedDraftRows || !weightsValid(parsedDraftRows)) {
      setWeightError(true);
      return;
    }
    setWeightError(false);
    setSaveBusy(true);
    try {
      await saveGradeBreakdown(courseId, parsedDraftRows);
      setSavedRows(parsedDraftRows);
      snapshotBeforeEdit.current = parsedDraftRows;
      setEditing(false);
    } finally {
      setSaveBusy(false);
    }
  }, [courseId, parsedDraftRows]);

  const addRow = useCallback(() => {
    setDraftRows((prev) => [...prev, { id: newRowId(), label: "", weightInput: "", scoreInput: "" }]);
  }, []);

  const removeRow = useCallback((id: string) => {
    setDraftRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateDraft = useCallback((id: string, patch: Partial<DraftRow>) => {
    setDraftRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const borderStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  };

  if (loading) {
    return (
      <View style={[borderStyle, styles.loadingBox]}>
        <ActivityIndicator color={colors.highlight} />
      </View>
    );
  }

  return (
    <View style={borderStyle}>
      <View style={styles.headerRow}>
        <Text style={[typography.heading, { color: colors.textPrimary }]}>Grade breakdown</Text>
        {!editing ? (
          <Pressable
            onPress={enterEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit grade breakdown"
            hitSlop={10}
          >
            <MaterialIcons name="edit" size={22} color={colors.highlight} />
          </Pressable>
        ) : null}
      </View>

      {!editing ? (
        <View style={{ gap: spacing.xs }}>
          {savedRows.map((row) => (
            <View key={row.id} style={styles.tabularRow}>
              <Text style={[styles.colLabel, typography.body, { color: colors.textPrimary }]} numberOfLines={1}>
                {row.label}
              </Text>
              <Text style={[styles.colWeight, typography.body, { color: colors.textSecondary }]}>
                ({formatPct(row.weightPercent)}):
              </Text>
              <Text style={[styles.colScore, typography.body, { color: colors.textPrimary }]}>
                {row.scoreText.trim().length === 0 ? "TBA" : row.scoreText}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <>
          <View style={{ gap: spacing.sm }}>
            {draftRows.map((row) => (
              <View key={row.id} style={styles.editRow}>
                <TextInput
                  value={row.label}
                  onChangeText={(t) => updateDraft(row.id, { label: t })}
                  placeholder="Label"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, typography.body, { color: colors.textPrimary, borderColor: colors.border }]}
                />
                <TextInput
                  value={row.weightInput}
                  onChangeText={(t) => updateDraft(row.id, { weightInput: t })}
                  placeholder="%"
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.inputSmall,
                    typography.body,
                    { color: colors.textPrimary, borderColor: colors.border },
                  ]}
                />
                <TextInput
                  value={row.scoreInput}
                  onChangeText={(t) => updateDraft(row.id, { scoreInput: t })}
                  placeholder="TBA if empty"
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.inputSmall,
                    typography.body,
                    { color: colors.textPrimary, borderColor: colors.border },
                  ]}
                />
                <Pressable
                  onPress={() => removeRow(row.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Remove component"
                  hitSlop={8}
                >
                  <MaterialIcons name="delete-outline" size={22} color={colors.danger} />
                </Pressable>
              </View>
            ))}
          </View>

          {weightError || (parsedDraftRows !== null && !weightsValid(parsedDraftRows)) ? (
            <Text style={[typography.caption, { color: colors.warning }]}>
              Weights must sum to 100% before saving.
            </Text>
          ) : null}
          {parsedDraftRows === null ? (
            <Text style={[typography.caption, { color: colors.warning }]}>
              Fill label, numeric weight, and numeric score (or leave score empty for TBA).
            </Text>
          ) : null}

          <View style={styles.footerActions}>
            <Pressable onPress={addRow} style={styles.iconBtn} accessibilityRole="button" hitSlop={8}>
              <MaterialIcons name="add-circle-outline" size={28} color={colors.highlight} />
            </Pressable>
            <Pressable
              onPress={save}
              disabled={!canSave || saveBusy}
              style={[styles.saveBtn, { opacity: !canSave || saveBusy ? 0.45 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Save grade breakdown"
            >
              {saveBusy ? (
                <ActivityIndicator color={colors.primaryDark} size="small" />
              ) : (
                <Text style={[typography.caption, { color: colors.primaryDark, fontWeight: "700" }]}>Save</Text>
              )}
            </Pressable>
          </View>

          <Pressable onPress={cancelEdit} hitSlop={8}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>Cancel</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function formatPct(w: number): string {
  if (Number.isInteger(w)) return `%${w}`;
  return `%${w}`;
}

const styles = StyleSheet.create({
  loadingBox: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabularRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colLabel: {
    flex: 2,
    minWidth: 0,
  },
  colWeight: {
    flex: 1,
    textAlign: "center",
  },
  colScore: {
    flex: 1,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 2,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputSmall: {
    width: 72,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontVariant: ["tabular-nums"],
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 4,
  },
  iconBtn: {
    padding: 4,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FFC85C",
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
  },
});
