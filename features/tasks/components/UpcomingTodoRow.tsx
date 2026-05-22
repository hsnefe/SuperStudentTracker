import { StyleSheet, Text, View } from "react-native";
import { AssignmentTodoRow } from "@/components/assignment/AssignmentTodoRow";
import { formatDeadlineDisplay } from "@/features/assignments/lib/assignmentFormUtils";
import { useTheme } from "@/hooks";
import type { TodoItem } from "@/types";

type Props = {
  todo: TodoItem;
  contextLabel?: string;
  onComplete: (todoId: string) => void;
};

export function UpcomingTodoRow({ todo, contextLabel, onComplete }: Props) {
  const { colors, radius, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
          gap: spacing.xs,
        },
      ]}
    >
      <AssignmentTodoRow
        todo={todo}
        labelColor={colors.textPrimary}
        onComplete={onComplete}
      />
      <View style={styles.meta}>
        {contextLabel ? (
          <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
            {contextLabel}
          </Text>
        ) : null}
        {todo.deadline ? (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Due {formatDeadlineDisplay(todo.deadline)}
          </Text>
        ) : (
          <Text style={[typography.caption, { color: colors.textMuted }]}>No deadline</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
  meta: {
    marginLeft: 24,
    gap: 2,
  },
});
