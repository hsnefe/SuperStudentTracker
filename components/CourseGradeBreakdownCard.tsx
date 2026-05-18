import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GradeBreakdownEditor } from "@/components/GradeBreakdownEditor";
import { parseGradeDrafts, toGradeDraft, weightsValid } from "@/lib/gradeBreakdown";
import { loadGradeBreakdown, saveGradeBreakdown } from "@/lib/persistence/courseGradeBreakdown";
import { useTheme } from "@/hooks";
import type { CourseGradeBreakdownRow } from "@/types";

type Props = {
  courseId: string;
  initialRows: CourseGradeBreakdownRow[];
};

export function CourseGradeBreakdownCard({ courseId, initialRows }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const [savedRows, setSavedRows] = useState<CourseGradeBreakdownRow[]>(initialRows);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draftRows, setDraftRows] = useState(() => initialRows.map(toGradeDraft));
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
      if (!editingRef.current) setDraftRows(next.map(toGradeDraft));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, initialRows]);

  const enterEdit = useCallback(() => {
    snapshotBeforeEdit.current = [...savedRows];
    setDraftRows(savedRows.map(toGradeDraft));
    setWeightError(false);
    setEditing(true);
  }, [savedRows]);

  const cancelEdit = useCallback(() => {
    const snap = snapshotBeforeEdit.current;
    setSavedRows(snap);
    setDraftRows(snap.map(toGradeDraft));
    setWeightError(false);
    setEditing(false);
  }, []);

  const parsedDraftRows = useMemo(() => parseGradeDrafts(draftRows), [draftRows]);

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
        <GradeBreakdownEditor mode="readonly" rows={savedRows} />
      ) : (
        <>
          <GradeBreakdownEditor
            mode="edit"
            draftRows={draftRows}
            onDraftChange={setDraftRows}
            showWeightError={
              weightError || (parsedDraftRows !== null && !weightsValid(parsedDraftRows))
            }
          />

          <View style={styles.footerActions}>
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
                <Text style={[typography.caption, { color: colors.primaryDark, fontWeight: "700" }]}>
                  Save
                </Text>
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
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 4,
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
