import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { AssignmentTodoRow } from "@/components/assignment/AssignmentTodoRow";
import { useTheme } from "@/hooks";
import type { TodoItem } from "@/types";

const MAX_VISIBLE_TODOS = 3;

export function todoProgressPercent(todos: TodoItem[]): number {
  if (todos.length === 0) return 0;
  return Math.round((todos.filter((t) => t.done).length / todos.length) * 100);
}

type Props = {
  todos: TodoItem[];
  labelColor: string;
  onTodoComplete: (todoId: string) => void;
  dueLabel?: string;
};

export function AssignmentStripCardTodoBlock({
  todos,
  labelColor,
  onTodoComplete,
  dueLabel,
}: Props) {
  const { colors, radius, spacing, typography } = useTheme();

  const incompleteTodos = useMemo(() => todos.filter((t) => !t.done), [todos]);
  const visibleTodos = incompleteTodos.slice(0, MAX_VISIBLE_TODOS);
  const moreCount = incompleteTodos.length - visibleTodos.length;
  const progressPct = todoProgressPercent(todos);

  return (
    <>
      <Animated.View layout={LinearTransition.duration(350)} style={styles.todoBlock}>
        {visibleTodos.map((todo) => (
          <AssignmentTodoRow
            key={todo.id}
            todo={todo}
            labelColor={labelColor}
            onComplete={onTodoComplete}
          />
        ))}
        {moreCount > 0 ? (
          <Text style={[styles.moreHint, { color: labelColor }]}>+{moreCount} more</Text>
        ) : null}
      </Animated.View>

      <View style={styles.footer}>
        {dueLabel ? (
          <Text style={[styles.due, { color: labelColor }]} numberOfLines={1}>
            {dueLabel}
          </Text>
        ) : null}
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
    </>
  );
}

const styles = StyleSheet.create({
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
