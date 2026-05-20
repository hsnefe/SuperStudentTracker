import { ScrollView, StyleSheet, Text } from "react-native";
import { AccountSettingsSection } from "@/features/auth/components/AccountSettingsSection";
import { MaterialPdfSettingsSection } from "@/features/materials/components/MaterialPdfSettingsSection";
import { ScreenContainer, PlaceholderCard } from "@/components";
import { useTheme } from "@/hooks";

export default function SettingsRoute() {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={[styles.content, { gap: spacing.lg }]}>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Settings</Text>

        <AccountSettingsSection />

        <MaterialPdfSettingsSection />

        <PlaceholderCard
          title="Notifications"
          description="Local reminders 1 hour before each class."
          hint="Phase 2 — wires up after schedule and notifications module."
        />

        <PlaceholderCard
          title="About"
          description="SuperStudentTracker · v1.0.0"
          hint="Built with Expo, React Native, Firebase."
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
});
