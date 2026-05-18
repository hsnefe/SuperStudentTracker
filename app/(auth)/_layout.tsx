import { Redirect, Stack, type Href } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTheme } from "@/hooks";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (user && isFirebaseConfigured) {
    return <Redirect href={"/(app)/(tabs)" as Href} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
