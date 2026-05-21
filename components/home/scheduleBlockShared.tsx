import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import {
  WEEK_GRID_END_HOUR,
  WEEK_GRID_START_HOUR,
  type MockScheduleBlock,
  type SchedulePriority,
} from "@/constants/weekScheduleMock";
import { HOME_LABEL_MUTED } from "@/constants/homeBlurVisual";
import { useTheme } from "@/hooks";

export function gridMinutesRange(): { start: number; end: number; span: number } {
  const start = WEEK_GRID_START_HOUR * 60;
  const end = WEEK_GRID_END_HOUR * 60;
  return { start, end, span: end - start };
}

export function priorityDotColor(
  priority: SchedulePriority,
  colors: ReturnType<typeof useTheme>["colors"],
): string {
  switch (priority) {
    case "done":
      return colors.success;
    case "low":
      return HOME_LABEL_MUTED;
    case "medium":
      return colors.highlight;
    case "high":
      return colors.accent;
    case "break":
      return HOME_LABEL_MUTED;
    default:
      return HOME_LABEL_MUTED;
  }
}

export function priorityLabel(priority: SchedulePriority): string {
  switch (priority) {
    case "done":
      return "Done";
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "break":
      return "Break";
    default:
      return "";
  }
}

export function blockBackground(
  priority: SchedulePriority,
  colors: ReturnType<typeof useTheme>["colors"],
): string {
  switch (priority) {
    case "done":
      return "rgba(255,255,255,0.06)";
    case "low":
      return "rgba(255,255,255,0.05)";
    case "medium":
      return "rgba(255,101,63,0.22)";
    case "high":
      return "rgba(30,16,78,0.85)";
    case "break":
      return "rgba(255,255,255,0.04)";
    default:
      return colors.surface;
  }
}

export function computeBlockLayout(
  block: MockScheduleBlock,
  minuteSpan: number,
  layoutHeightPx: number,
): { topPx: number; heightPx: number } {
  const { start } = gridMinutesRange();
  const topMin = Math.max(0, block.startMinute - start);
  const botMin = Math.min(minuteSpan, block.endMinute - start);
  const durMin = Math.max(15, botMin - topMin);
  const topPx = (topMin / minuteSpan) * layoutHeightPx;
  const heightPx = Math.max((durMin / minuteSpan) * layoutHeightPx, 36);
  return { topPx, heightPx };
}

type FaceProps = {
  block: MockScheduleBlock;
};

export function ScheduleTaskBlockFace({ block }: FaceProps) {
  const { colors, typography, spacing } = useTheme();
  const dot = priorityDotColor(block.priority, colors);
  const titleColor = "rgba(255,255,255,0.95)";
  const metaColor = HOME_LABEL_MUTED;

  return (
    <>
      {block.priority === "break" ? (
        <LinearGradient
          colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)", "rgba(255,255,255,0.06)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View style={[styles.taskInner, { padding: spacing.sm, gap: spacing.xs }]}>
        <View style={styles.taskMetaRow}>
          <View style={styles.priorityRow}>
            <View style={[styles.priorityDot, { backgroundColor: dot }]} />
            <Text style={[typography.caption, { color: metaColor }]}>
              {priorityLabel(block.priority)}
            </Text>
          </View>
          <View style={styles.iconMeta}>
            <Ionicons name="time-outline" size={12} color={metaColor} />
            <Text style={[typography.caption, { color: metaColor }]}>{block.durationLabel}</Text>
            <Ionicons name="chatbubble-outline" size={12} color={metaColor} />
            <Text style={[typography.caption, { color: metaColor }]}>{block.commentCount}</Text>
          </View>
        </View>
        <Text style={[typography.body, { color: titleColor, fontWeight: "600" }]} numberOfLines={2}>
          {block.title}
        </Text>
        <Text style={[typography.caption, { color: metaColor }]} numberOfLines={2}>
          {block.description}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  taskInner: {
    flex: 1,
  },
  taskMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  iconMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
