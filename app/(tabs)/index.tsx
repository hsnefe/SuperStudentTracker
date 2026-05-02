import { Text, View, StyleSheet } from "react-native";
import { ScreenContainer, PlaceholderCard } from "@/components";
import { useTheme } from "@/hooks";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function HomeScreen() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.title, { color: colors.textPrimary }]}>
          SuperStudentTracker
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Your weekly schedule, courses, tasks and notes — in one place.
        </Text>
      </View>

      <PlaceholderCard
        title="Today"
        description="Upcoming classes and tasks for today will appear here."
        hint="Phase 1 — connect schedule once classes are added."
      />

      <PlaceholderCard
        title="Quick stats"
        description="Attendance summary and pending tasks at a glance."
        hint="Phase 2 — wires up after attendance & tasks land."
      />

      <View
        style={[
          styles.statusRow,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: 10,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Cloud backup:
        </Text>
        <Text
          style={[
            typography.caption,
            { color: isSupabaseConfigured ? colors.success : colors.warning },
          ]}
        >
          {isSupabaseConfigured ? "Supabase configured" : "Set EXPO_PUBLIC_SUPABASE_* in .env"}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  },
});
