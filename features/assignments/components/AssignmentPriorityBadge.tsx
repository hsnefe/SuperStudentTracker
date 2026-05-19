import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  cyclePriority,
  priorityDotColor,
  priorityLabel,
} from "@/features/assignments/lib/assignmentFormUtils";
import type { AssignmentPriority } from "@/types";

type Props = {
  priority: AssignmentPriority;
  labelColor?: string;
  compact?: boolean;
  disabled?: boolean;
  onCycle: (next: AssignmentPriority) => void;
};

export function AssignmentPriorityBadge({
  priority,
  labelColor,
  compact,
  disabled,
  onCycle,
}: Props) {
  const dotColor = priorityDotColor(priority);

  return (
    <Pressable
      onPress={() => onCycle(cyclePriority(priority))}
      disabled={disabled}
      style={[
        styles.row,
        compact && styles.rowCompact,
        { opacity: disabled ? 0.45 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Importance ${priorityLabel(priority)}. Tap to change.`}
    >
      <View
        style={[
          styles.dot,
          compact && styles.dotCompact,
          { backgroundColor: dotColor },
        ]}
      />
      <Text
        style={[
          styles.label,
          compact && styles.labelCompact,
          labelColor ? { color: labelColor } : null,
        ]}
        numberOfLines={1}
      >
        {priorityLabel(priority)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  rowCompact: {
    gap: 4,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotCompact: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.92)",
  },
  labelCompact: {
    fontSize: 10,
    fontWeight: "700",
  },
});
