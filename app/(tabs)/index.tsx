import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { AssignmentCard, PlaceholderCard, ScreenContainer, WeekScheduleCard } from "@/components";
import { MOCK_HOME_ASSIGNMENTS } from "@/constants/homeMock";
import { useTheme } from "@/hooks";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function HomeScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(319, Math.max(260, windowWidth * 0.78));
  const cardGap = 16;

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.title, { color: colors.textPrimary }]}>SuperStudentTracker</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Your weekly schedule, courses, tasks and notes — in one place.
        </Text>
      </View>

      <WeekScheduleCard />

      <View
        style={[
          styles.todayPanel,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.lg,
            gap: spacing.sm,
          },
        ]}
      >
        <Text style={[typography.heading, { color: colors.textPrimary }]}>Today</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Upcoming classes and tasks for today will appear here.
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Phase 1 — connect schedule once classes are added.
        </Text>

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
            {MOCK_HOME_ASSIGNMENTS.map((a) => (
              <AssignmentCard key={a.id} assignment={a} width={cardWidth} />
            ))}
          </ScrollView>
        </View>
      </View>

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
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <Text style={[typography.caption, { color: colors.textMuted }]}>Cloud backup:</Text>
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
  todayPanel: {
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  },
});
