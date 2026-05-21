import type { Href } from "expo-router";
import { useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import {
  AssignmentStripCardBackground,
  STRIP_CARD_RADIUS,
  type AssignmentStripCardVariant,
} from "@/components/course/AssignmentStripCardBackground";
import { stripCardMetaColor } from "@/components/course/assignmentStripCardTypography";
import { GlassInteractionSurface } from "@/components/course/GlassInteractionSurface";
import { HomeAssignmentTodoRow } from "@/components/home/HomeAssignmentTodoRow";
import { formatDeadlineDisplay } from "@/features/assignments/lib/assignmentFormUtils";
import { AssignmentPriorityBadge } from "@/features/assignments/components/AssignmentPriorityBadge";
import { useExpandNavigation, useTheme } from "@/hooks";
import type { Assignment, AssignmentPriority } from "@/types";

const CARD_MIN_HEIGHT = 351;
const MAX_VISIBLE_TODOS = 3;

type Props = {
  variant: AssignmentStripCardVariant;
  assignment: Assignment;
  courseTitle?: string;
  width: number;
  href: Href;
  priorityDisabled?: boolean;
  onPriorityCycle?: (next: AssignmentPriority) => void;
  onTaskComplete: (taskId: string) => void;
};

function assignmentProgress(assignment: Assignment): number {
  const { tasks } = assignment;
  if (tasks.length === 0) return 0;
  return tasks.filter((t) => t.done).length / tasks.length;
}

export function HomeAssignmentStripCard({
  variant,
  assignment,
  courseTitle,
  width,
  href,
  priorityDisabled,
  onPriorityCycle,
  onTaskComplete,
}: Props) {
  const rootRef = useRef<View>(null);
  const { pushExpand } = useExpandNavigation();
  const { colors, radius, spacing, typography } = useTheme();
  const metaColor = stripCardMetaColor(variant);

  const incompleteTasks = useMemo(
    () => assignment.tasks.filter((t) => !t.done),
    [assignment.tasks],
  );
  const visibleTasks = incompleteTasks.slice(0, MAX_VISIBLE_TODOS);
  const moreCount = incompleteTasks.length - visibleTasks.length;
  const progressPct = Math.round(assignmentProgress(assignment) * 100);

  const faceSize = { width, minHeight: CARD_MIN_HEIGHT };

  const inner = (
    <View style={[styles.facePad, faceSize]}>
      <View style={styles.numRow}>
        {courseTitle ? (
          <Text
            style={[
              styles.courseLabel,
              variant === 1 ? styles.textLight : styles.courseAccent,
            ]}
            numberOfLines={1}
          >
            {courseTitle}
          </Text>
        ) : (
          <View style={styles.courseSpacer} />
        )}
        {onPriorityCycle ? (
          <AssignmentPriorityBadge
            compact
            priority={assignment.priority}
            labelColor={metaColor}
            disabled={priorityDisabled}
            onCycle={onPriorityCycle}
          />
        ) : null}
      </View>

      <Text style={[styles.cardTitle, variant === 1 && styles.textLight]} numberOfLines={2}>
        {assignment.title}
      </Text>

      {assignment.description.trim() ? (
        <Text
          style={[styles.desc, variant === 1 ? styles.descLight : styles.descMuted]}
          numberOfLines={2}
        >
          {assignment.description}
        </Text>
      ) : null}

      <Animated.View layout={LinearTransition.duration(350)} style={styles.todoBlock}>
        {visibleTasks.map((task) => (
          <HomeAssignmentTodoRow
            key={task.id}
            task={task}
            labelColor={metaColor}
            onComplete={onTaskComplete}
          />
        ))}
        {moreCount > 0 ? (
          <Text style={[styles.moreHint, { color: metaColor }]}>+{moreCount} more</Text>
        ) : null}
      </Animated.View>

      <View style={styles.footer}>
        <Text style={[styles.due, { color: metaColor }]} numberOfLines={1}>
          Due {formatDeadlineDisplay(assignment.deadline)}
        </Text>
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
          <Text
            style={[
              typography.caption,
              { color: "rgba(255,255,255,0.65)", marginTop: spacing.xs },
            ]}
          >
            {progressPct}%
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View ref={rootRef} collapsable={false} style={faceSize}>
      <GlassInteractionSurface
        borderRadius={STRIP_CARD_RADIUS}
        interactive
        enableScale
        onPress={() => pushExpand(href, rootRef)}
        style={faceSize}
        background={
          <AssignmentStripCardBackground
            variant={variant}
            style={faceSize}
            borderRadius={STRIP_CARD_RADIUS}
          />
        }
        accessibilityLabel={assignment.title}
      >
        {inner}
      </GlassInteractionSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  facePad: {
    padding: 12,
    justifyContent: "flex-start",
    gap: 6,
  },
  numRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    minHeight: 22,
  },
  courseLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    marginRight: 4,
  },
  courseAccent: {
    color: "#FF653F",
  },
  courseSpacer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
  },
  textLight: {
    color: "#fff",
  },
  desc: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
  },
  descMuted: {
    color: "rgba(255,255,255,0.72)",
  },
  descLight: {
    color: "rgba(255,255,255,0.88)",
  },
  todoBlock: {
    flex: 1,
    minHeight: 72,
    marginTop: 4,
  },
  moreHint: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    opacity: 0.85,
  },
  footer: {
    marginTop: "auto",
    gap: 6,
    paddingTop: 4,
  },
  due: {
    fontSize: 11,
    fontWeight: "600",
  },
  progressBlock: {
    minHeight: 36,
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
