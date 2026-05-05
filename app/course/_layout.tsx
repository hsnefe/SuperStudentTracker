import { Stack } from "expo-router";
import { useTheme } from "@/hooks";

export default function CourseStackLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: "600", color: colors.textPrimary },
        headerShadowVisible: false,
      }}
    />
  );
}
