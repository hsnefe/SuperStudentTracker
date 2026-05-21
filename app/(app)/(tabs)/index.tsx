import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { PlaceholderCard, ScreenContainer, WeekScheduleCard } from "@/components";
import { HomeTodayAssignmentsSection } from "@/components/home/HomeTodayAssignmentsSection";
import { useHomeAssignments } from "@/features/home/hooks/useHomeAssignments";
import { useTheme } from "@/hooks";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function HomeScreen() {
  const { colors, typography, spacing, radius } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(319, Math.max(260, windowWidth * 0.78));
  const cardGap = 16;
  const { items, loading } = useHomeAssignments();

  return (
    <ScreenContainer>
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.title, { color: colors.textPrimary }]}>SuperStudentTracker</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Your weekly schedule, courses, tasks and notes — in one place.
        </Text>
      </View>

      <WeekScheduleCard />

      <HomeTodayAssignmentsSection
        items={items}
        loading={loading}
        cardWidth={cardWidth}
        cardGap={cardGap}
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
            { color: isFirebaseConfigured ? colors.success : colors.warning },
          ]}
        >
          {isFirebaseConfigured ? "Firebase configured" : "Set EXPO_PUBLIC_FIREBASE_* in .env"}
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
