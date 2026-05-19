import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks";

export function AssignmentTodosSection() {
  const { colors, radius, spacing, typography } = useTheme();

  return (
    <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
      <Text style={[typography.heading, { color: colors.textPrimary }]}>To-dos</Text>
      <View
        style={[
          styles.placeholder,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.lg,
            gap: spacing.sm,
          },
        ]}
      >
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          To-do cards — coming in a later phase.
        </Text>
        {/* AssignmentTodoCards */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    borderWidth: 1,
  },
});
