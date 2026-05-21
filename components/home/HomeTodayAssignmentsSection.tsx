import { useCallback, useEffect, useState } from "react";
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
import {
  courseBlurMaxIntensity,
} from "@/constants/courseDetailVisual";
import type { HomeAssignmentItem } from "@/features/home/hooks/useHomeAssignments";
import { useToggleAssignmentTask } from "@/features/home/hooks/useToggleAssignmentTask";
import { useUpdateAssignment } from "@/features/assignments/hooks/useUpdateAssignment";
import { useTheme } from "@/hooks";
import type { Assignment, AssignmentPriority } from "@/types";

type Props = {
  items: HomeAssignmentItem[];
  loading: boolean;
  cardWidth: number;
  cardGap: number;
  style?: StyleProp<ViewStyle>;
};

export function HomeTodayAssignmentsSection({
  items,
  loading,
  cardWidth,
  cardGap,
  style,
}: Props) {
  const { typography, spacing } = useTheme();
  const updateAssignment = useUpdateAssignment();
  const toggleTask = useToggleAssignmentTask();
  const maxIntensity = courseBlurMaxIntensity();

  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

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

  const handleTaskComplete = useCallback(
    (assignment: Assignment, taskId: string) => {
      let snapshot: HomeAssignmentItem[] = [];
      setLocalItems((prev) => {
        snapshot = prev;
        return prev.map((item) => {
          if (item.assignment.id !== assignment.id) return item;
          return {
            ...item,
            assignment: {
              ...item.assignment,
              tasks: item.assignment.tasks.map((t) =>
                t.id === taskId ? { ...t, done: true } : t,
              ),
            },
          };
        });
      });

      toggleTask.mutate(
        {
          routeCourseId: assignment.courseId,
          assignmentId: assignment.id,
          taskId,
        },
        {
          onError: () => {
            setLocalItems(snapshot);
          },
        },
      );
    },
    [toggleTask],
  );

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

      <View style={[styles.foreground, { padding: spacing.lg }]}>
        <Text
          style={[typography.title, styles.title]}
          accessibilityRole="header"
        >
          TODAY
        </Text>

        {loading ? (
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
                return (
                  <HomeAssignmentStripCard
                    key={assignment.id}
                    variant={variant}
                    assignment={assignment}
                    courseTitle={courseTitle}
                    width={cardWidth}
                    priorityDisabled={updateAssignment.isPending}
                    onPriorityCycle={(next) => handlePriorityChange(assignment, next)}
                    onTaskComplete={(taskId) => handleTaskComplete(assignment, taskId)}
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
    borderRadius: 16,
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
