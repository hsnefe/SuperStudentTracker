import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  formatGradePct,
  newGradeRowId,
  parseGradeDrafts,
  weightsValid,
  type GradeBreakdownDraftRow,
} from "@/lib/gradeBreakdown";
import { useTheme } from "@/hooks";
import type { CourseGradeBreakdownRow } from "@/types";

type ReadonlyProps = {
  mode: "readonly";
  rows: CourseGradeBreakdownRow[];
};

type EditProps = {
  mode: "edit";
  draftRows: GradeBreakdownDraftRow[];
  onDraftChange: (drafts: GradeBreakdownDraftRow[]) => void;
  showWeightError?: boolean;
  disabled?: boolean;
  compact?: boolean;
  wide?: boolean;
};

type Props = ReadonlyProps | EditProps;

export function GradeBreakdownEditor(props: Props) {
  const { colors, spacing, typography, radius } = useTheme();

  if (props.mode === "readonly") {
    return (
      <View style={{ gap: spacing.xs }}>
        {props.rows.map((row) => (
          <View key={row.id} style={styles.tabularRow}>
            <Text
              style={[styles.colLabel, typography.body, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {row.label}
            </Text>
            <Text style={[styles.colWeight, typography.body, { color: colors.textSecondary }]}>
              ({formatGradePct(row.weightPercent)}):
            </Text>
            <Text style={[styles.colScore, typography.body, { color: colors.textPrimary }]}>
              {row.scoreText.trim().length === 0 ? "TBA" : row.scoreText}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  const { draftRows, onDraftChange, showWeightError, disabled, compact, wide } = props;
  const parsed = useMemo(() => parseGradeDrafts(draftRows), [draftRows]);
  const weightOk = parsed !== null && weightsValid(parsed);

  const updateDraft = useCallback(
    (id: string, patch: Partial<GradeBreakdownDraftRow>) => {
      onDraftChange(draftRows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    },
    [draftRows, onDraftChange],
  );

  const addRow = useCallback(() => {
    onDraftChange([
      ...draftRows,
      { id: newGradeRowId(), label: "", weightInput: "", scoreInput: "" },
    ]);
  }, [draftRows, onDraftChange]);

  const removeRow = useCallback(
    (id: string) => {
      onDraftChange(draftRows.filter((r) => r.id !== id));
    },
    [draftRows, onDraftChange],
  );

  return (
    <View style={{ gap: spacing.sm }}>
      {draftRows.map((row) => (
        <View key={row.id} style={styles.editRow}>
          <TextInput
            value={row.label}
            onChangeText={(t) => updateDraft(row.id, { label: t })}
            placeholder="Bileşen"
            placeholderTextColor={colors.textMuted}
            editable={!disabled}
            style={[
              styles.input,
              typography.body,
              { color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.sm },
            ]}
          />
          <TextInput
            value={row.weightInput}
            onChangeText={(t) => updateDraft(row.id, { weightInput: t })}
            placeholder="%"
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textMuted}
            editable={!disabled}
            style={[
              wide ? styles.inputWide : styles.inputSmall,
              typography.body,
              { color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.sm },
            ]}
          />
          <TextInput
            value={row.scoreInput}
            onChangeText={(t) => updateDraft(row.id, { scoreInput: t })}
            placeholder="TBA"
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textMuted}
            editable={!disabled}
            style={[
              wide ? styles.inputWide : styles.inputSmall,
              typography.body,
              { color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.sm },
            ]}
          />
          <Pressable
            onPress={() => removeRow(row.id)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Satırı kaldır"
            hitSlop={8}
          >
            <MaterialIcons name="delete-outline" size={22} color={colors.danger} />
          </Pressable>
        </View>
      ))}

      {showWeightError && !weightOk ? (
        <Text style={[typography.caption, { color: colors.warning }]}>
          Ağırlıklar kaydetmeden önce %100 olmalıdır.
        </Text>
      ) : null}
      {parsed === null ? (
        <Text style={[typography.caption, { color: colors.warning }]}>
          Etiket, sayısal ağırlık ve skor (boş = TBA) doldurun.
        </Text>
      ) : null}

      <Pressable
        onPress={addRow}
        disabled={disabled}
        style={styles.addRowBtn}
        accessibilityRole="button"
        hitSlop={8}
      >
        <MaterialIcons name="add-circle-outline" size={compact ? 24 : 28} color={colors.highlight} />
        <Text style={[typography.caption, { color: colors.highlight }]}>Bileşen ekle</Text>
      </Pressable>
    </View>
  );
}

export { weightsValid, parseGradeDrafts };

const styles = StyleSheet.create({
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
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputSmall: {
    width: 64,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontVariant: ["tabular-nums"],
  },
  inputWide: {
    width: 120,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontVariant: ["tabular-nums"],
  },
  addRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
});
