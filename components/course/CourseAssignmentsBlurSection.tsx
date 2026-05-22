import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  AssignmentStripCard,
  COURSE_STRIP_CARD_WIDTH,
} from "@/components/course/AssignmentStripCard";
import { VerticalBlurRamp } from "@/components/course/VerticalBlurRamp";
import {
  COURSE_BLUR_BRIDGE_HALF_PX,
  courseBlurMaxIntensity,
} from "@/constants/courseDetailVisual";
import { useTheme } from "@/hooks";
import type { Assignment, AssignmentPriority, TodoItem } from "@/types";

type Props = {
  courseId: string;
  courseTitle: string;
  assignments: Assignment[];
  todosByAssignmentId: Map<string, TodoItem[]>;
  loading: boolean;
  onAddPress: () => void;
  onTodoComplete: (assignmentId: string, todoId: string) => void;
  priorityBusy?: boolean;
  onPriorityChange?: (assignment: Assignment, nextPriority: AssignmentPriority) => void;
  /** Grows to fill scroll area below hero (e.g. `{ flex: 1 }`). */
  style?: StyleProp<ViewStyle>;
};

export function CourseAssignmentsBlurSection({
  courseId,
  courseTitle,
  assignments,
  todosByAssignmentId,
  loading,
  onAddPress,
  onTodoComplete,
  priorityBusy,
  onPriorityChange,
  style,
}: Props) {
  const { typography, spacing } = useTheme();
  const addButtonRef = useRef<View>(null);
  const maxIntensity = courseBlurMaxIntensity();

  return (
    <View style={[styles.outer, style]}>
      <VerticalBlurRamp
        fillParent
        direction="decrease"
        maxIntensity={maxIntensity}
        overlayGradient={[
          "rgba(18,12,22,0.72)",
          "rgba(12,10,18,0.38)",
          "rgba(8,6,12,0.08)",
        ]}
        style={styles.bgLayer}
      />

      <View
        style={[styles.blurTopBridge, { height: COURSE_BLUR_BRIDGE_HALF_PX }]}
        pointerEvents="none"
      >
        <VerticalBlurRamp
          direction="decrease"
          height={COURSE_BLUR_BRIDGE_HALF_PX}
          maxIntensity={maxIntensity}
          overlayGradient={[
            "rgba(10,8,12,0.92)",
            "rgba(10,8,12,0.4)",
            "transparent",
          ]}
        />
      </View>

      <View style={[styles.foreground, { padding: spacing.lg }]}>
        <View style={styles.titleBar}>
          <Text
            style={[typography.title, styles.title]}
            accessibilityRole="header"
          >
            ASSIGNMENTS
          </Text>
          <Pressable
            ref={addButtonRef}
            onPress={onAddPress}
            accessibilityRole="button"
            accessibilityLabel="Add assignment"
            hitSlop={12}
            style={styles.addBtn}
          >
            <MaterialIcons name="add" size={26} color="#FFC85C" />
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color="#FFC85C" style={{ paddingVertical: spacing.lg }} />
        ) : assignments.length === 0 ? (
          <Text style={[typography.body, styles.empty]}>
            No assignments yet. Tap + to add one.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            decelerationRate="fast"
            contentContainerStyle={{
              gap: spacing.sm,
              paddingVertical: spacing.xs,
              paddingRight: spacing.sm,
            }}
          >
            {assignments.map((a, i) => (
              <AssignmentStripCard
                key={a.id}
                variant={(i % 4) as 0 | 1 | 2 | 3}
                indexLabel={String(i + 1).padStart(2, "0")}
                assignment={a}
                todos={todosByAssignmentId.get(a.id) ?? []}
                width={COURSE_STRIP_CARD_WIDTH}
                priorityDisabled={priorityBusy}
                onPriorityCycle={
                  onPriorityChange
                    ? (next) => onPriorityChange(a, next)
                    : undefined
                }
                onTodoComplete={(todoId) => onTodoComplete(a.id, todoId)}
                href={{
                  pathname: "/course/[id]/assignment/[assignmentId]",
                  params: {
                    id: courseId,
                    assignmentId: a.id,
                    courseTitle,
                    cardVariant: String(i % 4),
                  },
                }}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "relative",
    overflow: "hidden",
    minHeight: 160,
  },
  bgLayer: {
    zIndex: 0,
  },
  blurTopBridge: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1,
  },
  foreground: {
    position: "relative",
    zIndex: 2,
    flex: 1,
  },
  titleBar: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    minHeight: 44,
    paddingHorizontal: 52,
  },
  title: {
    flex: 1,
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  addBtn: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  empty: {
    color: "rgba(255,255,255,0.65)",
    paddingVertical: 8,
    textAlign: "center",
  },
});
