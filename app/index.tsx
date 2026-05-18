import { Redirect, type Href } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTheme } from "@/hooks";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function IndexRoute() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!isFirebaseConfigured || !user) {
    return <Redirect href={"/(auth)" as Href} />;
  }

  return <Redirect href={"/(app)/(tabs)" as Href} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
