import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { HomeAssignmentStripCard } from "@/components/home/HomeAssignmentStripCard";
import { VerticalBlurRamp } from "@/components/course/VerticalBlurRamp";
import { courseBlurMaxIntensity } from "@/constants/courseDetailVisual";
import {
  HOME_BLUR_BORDER_RADIUS,
  HOME_BLUR_OVERLAY_GRADIENT,
} from "@/constants/homeBlurVisual";
import type { HomeAssignmentItem } from "@/features/home/hooks/useHomeAssignments";
import { useUpdateAssignment } from "@/features/assignments/hooks/useUpdateAssignment";
import { useTodosByAssignmentIds } from "@/features/todos/hooks/useTodosByAssignmentIds";
import { useToggleTodoDone } from "@/features/todos/hooks/useToggleTodoDone";
import { useTheme } from "@/hooks";
import type { Assignment, AssignmentPriority, TodoItem } from "@/types";

type Props = {
  items: HomeAssignmentItem[];
  loading: boolean;
  cardWidth: number;
  cardGap: number;
  style?: StyleProp<ViewStyle>;
};

function markTodoDoneInMap(
  map: Map<string, TodoItem[]>,
  assignmentId: string,
  todoId: string,
): Map<string, TodoItem[]> {
  const next = new Map(map);
  const list = next.get(assignmentId);
  if (!list) return next;
  next.set(
    assignmentId,
    list.map((t) => (t.id === todoId ? { ...t, done: true } : t)),
  );
  return next;
}

export function HomeTodayAssignmentsSection({
  items,
  loading,
  cardWidth,
  cardGap,
  style,
}: Props) {
  const { typography, spacing } = useTheme();
  const updateAssignment = useUpdateAssignment();
  const toggleTodo = useToggleTodoDone();
  const maxIntensity = courseBlurMaxIntensity();

  const [localItems, setLocalItems] = useState(items);
  const assignmentIds = useMemo(
    () => localItems.map((item) => item.assignment.id),
    [localItems],
  );
  const {
    todosByAssignmentId,
    loading: todosLoading,
    dataUpdatedAt: todosDataUpdatedAt,
  } = useTodosByAssignmentIds(assignmentIds);
  const [optimisticTodosByAssignment, setOptimisticTodosByAssignment] = useState<
    Map<string, TodoItem[]> | null
  >(null);

  const displayTodosByAssignment = optimisticTodosByAssignment ?? todosByAssignmentId;

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useEffect(() => {
    setOptimisticTodosByAssignment(null);
  }, [todosDataUpdatedAt]);

  const handlePriorityChange = useCallback(
    (assignment: Assignment, nextPriority: AssignmentPriority) => {
      updateAssignment.mutate(
        {
          routeCourseId: assignment.courseId,
          assignmentId: assignment.id,
          input: {
            title: assignment.title,
            type: assignment.type,
            courseId: assignment.courseId,
            deadline: assignment.deadline,
            priority: nextPriority,
            status: assignment.status,
          },
        },
        {
          onSuccess: (updated) => {
            setLocalItems((prev) =>
              prev.map((item) =>
                item.assignment.id === updated.id
                  ? { ...item, assignment: updated }
                  : item,
              ),
            );
          },
        },
      );
    },
    [updateAssignment],
  );

  const handleTodoComplete = useCallback(
    (assignmentId: string, todoId: string) => {
      const base = optimisticTodosByAssignment ?? todosByAssignmentId;
      const snapshot = optimisticTodosByAssignment ?? todosByAssignmentId;
      setOptimisticTodosByAssignment(markTodoDoneInMap(base, assignmentId, todoId));

      toggleTodo.mutate(
        { todoId, done: true },
        {
          onError: () => {
            setOptimisticTodosByAssignment(
              snapshot === todosByAssignmentId ? null : new Map(snapshot),
            );
          },
          onSuccess: () => {
            setOptimisticTodosByAssignment(null);
          },
        },
      );
    },
    [optimisticTodosByAssignment, todosByAssignmentId, toggleTodo],
  );

  const sectionLoading = loading || (assignmentIds.length > 0 && todosLoading);

  return (
    <View style={[styles.outer, style]}>
      <VerticalBlurRamp
        fillParent
        direction="decrease"
        maxIntensity={maxIntensity}
        overlayGradient={[...HOME_BLUR_OVERLAY_GRADIENT]}
        style={styles.bgLayer}
      />

      <View style={[styles.foreground, { padding: spacing.lg }]}>
        <Text
          style={[typography.title, styles.title]}
          accessibilityRole="header"
        >
          TODAY
        </Text>

        {sectionLoading ? (
          <ActivityIndicator color="#FFC85C" style={{ paddingVertical: spacing.lg }} />
        ) : localItems.length === 0 ? (
          <Text style={[typography.body, styles.empty]}>
            No assignments yet. Add assignments from a course.
          </Text>
        ) : (
          <View style={{ marginHorizontal: -spacing.lg, marginTop: spacing.sm }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: spacing.lg,
                gap: cardGap,
                paddingBottom: spacing.xs,
              }}
            >
              {localItems.map((item, i) => {
                const { assignment, courseTitle } = item;
                const variant = (i % 4) as 0 | 1 | 2 | 3;
                const todos = displayTodosByAssignment.get(assignment.id) ?? [];
                return (
                  <HomeAssignmentStripCard
                    key={assignment.id}
                    variant={variant}
                    assignment={assignment}
                    todos={todos}
                    courseTitle={courseTitle}
                    width={cardWidth}
                    priorityDisabled={updateAssignment.isPending}
                    onPriorityCycle={(next) => handlePriorityChange(assignment, next)}
                    onTodoComplete={(todoId) => handleTodoComplete(assignment.id, todoId)}
                    href={{
                      pathname: "/course/[id]/assignment/[assignmentId]",
                      params: {
                        id: assignment.courseId,
                        assignmentId: assignment.id,
                        courseTitle: courseTitle ?? "",
                        cardVariant: String(variant),
                      },
                    }}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "relative",
    overflow: "hidden",
    borderRadius: HOME_BLUR_BORDER_RADIUS,
    minHeight: 200,
  },
  bgLayer: {
    zIndex: 0,
  },
  foreground: {
    position: "relative",
    zIndex: 2,
  },
  title: {
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  empty: {
    color: "rgba(255,255,255,0.65)",
    paddingVertical: 8,
    textAlign: "center",
  },
});
