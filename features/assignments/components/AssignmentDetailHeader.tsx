import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks";

type Props = {
  editing: boolean;
  editDisabled?: boolean;
  busy?: boolean;
  canSave?: boolean;
  onBack: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
};

export function AssignmentDetailHeader({
  editing,
  editDisabled,
  busy,
  canSave,
  onBack,
  onEdit,
  onCancel,
  onSave,
}: Props) {
  const { colors, typography, radius, spacing } = useTheme();

  return (
    <View style={[styles.row, { paddingBottom: spacing.sm }]}>
      <Pressable
        onPress={onBack}
        disabled={busy}
        style={[styles.iconBtn, { borderColor: colors.border, borderRadius: radius.md }]}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <MaterialIcons name="arrow-back" size={22} color={colors.textPrimary} />
      </Pressable>

      <View style={[styles.actions, { gap: spacing.sm }]}>
        {editing ? (
          <>
            <Pressable
              onPress={onCancel}
              disabled={busy}
              style={[styles.secondaryBtn, { borderColor: colors.border, borderRadius: radius.md }]}
              accessibilityRole="button"
            >
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              disabled={!canSave || busy}
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: colors.accent,
                  borderRadius: radius.md,
                  opacity: canSave && !busy ? 1 : 0.45,
                },
              ]}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[typography.caption, styles.primaryLabel]}>Save</Text>
              )}
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={onEdit}
            disabled={editDisabled || busy}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.md,
                opacity: editDisabled || busy ? 0.45 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Edit assignment"
          >
            <MaterialIcons name="edit" size={18} color="#fff" />
            <Text style={[typography.caption, styles.primaryLabel]}>Edit</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 72,
    justifyContent: "center",
  },
  primaryLabel: {
    color: "#fff",
    fontWeight: "700",
  },
});
