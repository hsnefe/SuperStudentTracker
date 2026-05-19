import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { AssignmentStripCardVariant } from "@/components/course/AssignmentStripCardBackground";
import { stripCardMetaColor, stripCardTitleColor } from "@/components/course/assignmentStripCardTypography";
import { useTheme } from "@/hooks";

type Props = {
  variant: AssignmentStripCardVariant;
  editing: boolean;
  statusLabel: string;
  editDisabled?: boolean;
  busy?: boolean;
  canSave?: boolean;
  onBack: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
};

export function AssignmentDetailHeader({
  variant,
  editing,
  statusLabel,
  editDisabled,
  busy,
  canSave,
  onBack,
  onEdit,
  onCancel,
  onSave,
}: Props) {
  const { typography, radius, spacing } = useTheme();
  const iconColor = stripCardTitleColor(variant);
  const statusColor = stripCardMetaColor(variant);

  return (
    <View style={[styles.row, { paddingBottom: spacing.md }]}>
      <Pressable
        onPress={onBack}
        disabled={busy}
        style={styles.iconBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <MaterialIcons name="arrow-back" size={24} color={iconColor} />
      </Pressable>

      <View style={[styles.actions, { gap: spacing.sm }]}>
        {statusLabel ? (
          <Text style={[styles.status, { color: statusColor }]} numberOfLines={1}>
            {statusLabel}
          </Text>
        ) : null}

        {editing ? (
          <>
            <Pressable
              onPress={onCancel}
              disabled={busy}
              style={[styles.secondaryBtn, { borderRadius: radius.md }]}
              accessibilityRole="button"
            >
              <Text style={[typography.caption, styles.secondaryLabel]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              disabled={!canSave || busy}
              style={[
                styles.primaryBtn,
                {
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
  },
  actions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  status: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  secondaryLabel: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 72,
    justifyContent: "center",
    backgroundColor: "#FF653F",
  },
  primaryLabel: {
    color: "#fff",
    fontWeight: "700",
  },
});
