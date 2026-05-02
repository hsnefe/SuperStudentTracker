import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks";
import type { Assignment } from "@/types";

/** Figma export node 4:70 — description strip (leave stops as in file). */
const DESCRIPTION_GRADIENT = ["#ac7f5e", "#e65715", "#ffcc00"] as const;

const CARD_FACE = "#d9d9d9";
const TASK_PANEL = "#3b4252";
const TASK_LIST = "#d51717";
const TITLE_COLOR = "#0f1115";
const DESC_TEXT = "#0f1115";

type Props = {
  assignment: Assignment;
  width: number;
};

function assignmentProgress(assignment: Assignment): number {
  const { tasks } = assignment;
  if (tasks.length === 0) return 0;
  return tasks.filter((t) => t.done).length / tasks.length;
}

export function AssignmentCard({ assignment, width }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const progress = assignmentProgress(assignment);
  const progressPct = Math.round(progress * 100);

  return (
    <View style={[styles.outer, { width, backgroundColor: CARD_FACE, borderRadius: 28 }]}>
      <Text style={[styles.title, { color: TITLE_COLOR }]} numberOfLines={1}>
        {assignment.title}
      </Text>

      <View style={[styles.slot, { borderRadius: 20 }]}>
        <LinearGradient
          colors={[...DESCRIPTION_GRADIENT]}
          locations={[0, 0.35, 0.79]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.gradientStrip, { borderRadius: 9 }]}
        >
          <Text style={styles.descText} numberOfLines={3}>
            {assignment.description}
          </Text>
        </LinearGradient>
      </View>

      <View style={[styles.taskPanel, { borderRadius: 15, backgroundColor: TASK_PANEL }]}>
        <View style={styles.taskList}>
          {assignment.tasks.map((task) => (
            <Text key={task.id} style={styles.taskBullet} numberOfLines={2}>
              {"\u2022 "}
              {task.title}
            </Text>
          ))}
        </View>

        <View style={styles.progressBlock}>
          <View style={[styles.track, { borderRadius: radius.pill }]}>
            <View
              style={[
                styles.fill,
                {
                  width: `${progressPct}%`,
                  backgroundColor: colors.highlight,
                  borderRadius: radius.pill,
                },
              ]}
            />
          </View>
          <Text style={[typography.caption, { color: "rgba(255,255,255,0.65)", marginTop: spacing.xs }]}>
            {progressPct}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 7,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 10,
    minHeight: 351,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 11,
    marginTop: 4,
  },
  slot: {
    height: 101,
    backgroundColor: CARD_FACE,
    overflow: "hidden",
    justifyContent: "flex-end",
    paddingHorizontal: 7,
    paddingBottom: 6,
  },
  gradientStrip: {
    minHeight: 47,
    paddingHorizontal: 9,
    paddingVertical: 9,
    justifyContent: "center",
  },
  descText: {
    fontSize: 11,
    fontWeight: "600",
    color: DESC_TEXT,
  },
  taskPanel: {
    minHeight: 155,
    paddingHorizontal: 13,
    paddingTop: 16,
    paddingBottom: 10,
  },
  taskList: {
    gap: 6,
    flex: 1,
  },
  taskBullet: {
    fontSize: 13,
    fontWeight: "700",
    color: TASK_LIST,
  },
  progressBlock: {
    marginTop: 8,
    minHeight: 52,
    justifyContent: "center",
  },
  track: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
