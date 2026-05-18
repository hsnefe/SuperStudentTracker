import { Redirect, Stack, type Href } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { EmailVerificationBanner } from "@/features/auth/components/EmailVerificationBanner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTheme } from "@/hooks";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  if (!isFirebaseConfigured) {
    return <Redirect href={"/(auth)" as Href} />;
  }

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href={"/(auth)" as Href} />;
  }

  return (
    <View style={styles.root}>
      <EmailVerificationBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course" options={{ animation: "none" }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
