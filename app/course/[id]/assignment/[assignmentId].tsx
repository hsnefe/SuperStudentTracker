import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/hooks";

export default function AssignmentDetailPlaceholderScreen() {
  const params = useLocalSearchParams<{
    assignmentId: string | string[];
    id?: string | string[];
    courseTitle?: string | string[];
  }>();

  const assignRaw = params.assignmentId;
  const assignmentId = Array.isArray(assignRaw) ? assignRaw[0] : assignRaw ?? "";

  const titleRaw = params.courseTitle;
  const courseTitle =
    typeof titleRaw === "string"
      ? titleRaw
      : Array.isArray(titleRaw)
        ? titleRaw[0]
        : undefined;

  const { typography, spacing, colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
        <View style={{ gap: spacing.md, padding: spacing.lg }}>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Assignment detail</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Assignment detail — coming soon.
          </Text>
          {assignmentId ? (
            <Text style={[typography.caption, { color: colors.textMuted }]}>Id: {assignmentId}</Text>
          ) : null}
          {courseTitle ? (
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Course: {courseTitle}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>
    </>
  );
}
