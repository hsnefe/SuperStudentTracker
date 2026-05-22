import { StyleSheet, Text, View } from "react-native";
import type { AssignmentStripCardVariant } from "@/components/course/AssignmentStripCardBackground";
import { stripCardMetaColor, stripCardTitleColor } from "@/components/course/assignmentStripCardTypography";
import { AssignmentTodoRow } from "@/components/assignment/AssignmentTodoRow";
import { useTheme } from "@/hooks";
import type { TodoItem } from "@/types";

type Props = {
  variant?: AssignmentStripCardVariant;
  todos: TodoItem[];
  loading?: boolean;
  onToggle: (todoId: string, done: boolean) => void;
};

export function AssignmentTodosSection({
  variant = 0,
  todos,
  loading,
  onToggle,
}: Props) {
  const { radius, spacing, typography } = useTheme();
  const titleColor = stripCardTitleColor(variant);
  const metaColor = stripCardMetaColor(variant);

  return (
    <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
      <Text style={[typography.heading, { color: titleColor }]}>To-dos</Text>
      <View
        style={[
          styles.list,
          {
            borderColor: "rgba(255,255,255,0.2)",
            borderRadius: radius.lg,
            padding: spacing.md,
            gap: spacing.xs,
            backgroundColor: "rgba(0,0,0,0.18)",
          },
        ]}
      >
        {loading ? (
          <Text style={[typography.body, { color: metaColor }]}>Loading…</Text>
        ) : todos.length === 0 ? (
          <Text style={[typography.body, { color: metaColor }]}>No to-dos for this assignment.</Text>
        ) : (
          todos.map((todo) => (
            <AssignmentTodoRow
              key={todo.id}
              todo={todo}
              labelColor={metaColor}
              onToggle={onToggle}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderWidth: 1,
  },
});
