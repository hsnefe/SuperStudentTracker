import type { Href } from "expo-router";
import { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  AssignmentStripCardBackground,
  STRIP_CARD_RADIUS,
  type AssignmentStripCardVariant,
} from "@/components/course/AssignmentStripCardBackground";
import { stripCardMetaColor } from "@/components/course/assignmentStripCardTypography";
import { GlassInteractionSurface } from "@/components/course/GlassInteractionSurface";
import { AssignmentStripCardTodoBlock } from "@/components/assignment/AssignmentStripCardTodoBlock";
import { HOME_STRIP_CARD_MIN_HEIGHT } from "@/components/home/HomeAssignmentStripCard";
import { formatDeadlineDisplay } from "@/features/assignments/lib/assignmentFormUtils";
import { AssignmentPriorityBadge } from "@/features/assignments/components/AssignmentPriorityBadge";
import { useExpandNavigation } from "@/hooks";
import type { Assignment, AssignmentPriority, TodoItem } from "@/types";

const ORANGE = "#FF653F";
const CARD_RADIUS = STRIP_CARD_RADIUS;

export const COURSE_STRIP_CARD_WIDTH = 168;

type Props = {
  variant: AssignmentStripCardVariant;
  indexLabel: string;
  assignment: Assignment;
  todos: TodoItem[];
  href: Href;
  width: number;
  priorityDisabled?: boolean;
  onPriorityCycle?: (next: AssignmentPriority) => void;
  onTodoComplete: (todoId: string) => void;
};

export function AssignmentStripCard({
  variant,
  indexLabel,
  assignment,
  todos,
  href,
  width,
  priorityDisabled,
  onPriorityCycle,
  onTodoComplete,
}: Props) {
  const rootRef = useRef<View>(null);
  const { pushExpand } = useExpandNavigation();
  const metaColor = stripCardMetaColor(variant);

  const faceSize = { width, minHeight: HOME_STRIP_CARD_MIN_HEIGHT };

  const inner = (
    <View style={[styles.facePad, faceSize]}>
      <View style={styles.numRow}>
        <Text
          style={[
            styles.num,
            variant === 1 ? styles.numLight : variant === 3 ? styles.numLight : styles.numAccent,
          ]}
        >
          {indexLabel}
        </Text>
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
      <AssignmentStripCardTodoBlock
        todos={todos}
        labelColor={metaColor}
        onTodoComplete={onTodoComplete}
        dueLabel={`Due ${formatDeadlineDisplay(assignment.deadline)}`}
      />
    </View>
  );

  return (
    <View ref={rootRef} collapsable={false} style={faceSize}>
      <GlassInteractionSurface
        borderRadius={CARD_RADIUS}
        interactive
        enableScale
        onPress={() => pushExpand(href, rootRef)}
        style={faceSize}
        background={
          <AssignmentStripCardBackground variant={variant} style={faceSize} borderRadius={CARD_RADIUS} />
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
  num: {
    fontSize: 18,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  numAccent: {
    color: ORANGE,
  },
  numLight: {
    color: "#fff",
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
});
