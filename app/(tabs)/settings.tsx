import { Text } from "react-native";
import { ScreenContainer, PlaceholderCard } from "@/components";
import { useTheme } from "@/hooks";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function SettingsRoute() {
  const { colors, typography } = useTheme();

  return (
    <ScreenContainer>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Settings</Text>

      <PlaceholderCard
        title="Account"
        description="Sign in with Supabase to enable cloud backup."
        hint={
          isSupabaseConfigured
            ? "Supabase keys detected — auth UI lands in Phase 1."
            : "Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env"
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
        hint="Built with Expo, React Native, Supabase."
      />
    </ScreenContainer>
  );
}
