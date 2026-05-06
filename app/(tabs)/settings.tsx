import { Text } from "react-native";
import { ScreenContainer, PlaceholderCard } from "@/components";
import { useTheme } from "@/hooks";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function SettingsRoute() {
  const { colors, typography } = useTheme();

  return (
    <ScreenContainer>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Settings</Text>

      <PlaceholderCard
        title="Account"
        description="Sign in with Firebase to enable cloud backup."
        hint={
          isFirebaseConfigured
            ? "Firebase keys detected — auth UI lands in Phase 1."
            : "Add EXPO_PUBLIC_FIREBASE_* values to .env"
        }
      />

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
    </ScreenContainer>
  );
}
