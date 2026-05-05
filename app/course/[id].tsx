import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks";

export default function CourseDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[]; title?: string | string[] }>();
  const { colors, typography, spacing } = useTheme();

  const idRaw = params.id;
  const titleRaw = params.title;
  const id = Array.isArray(idRaw) ? idRaw[0] : idRaw ?? "";
  const titleParam = Array.isArray(titleRaw) ? titleRaw[0] : titleRaw;
  const title =
    typeof titleParam === "string" && titleParam.length > 0 ? titleParam : "Course";

  const headerTitle = title.length > 42 ? `${title.slice(0, 42)}…` : title;

  return (
    <>
      <Stack.Screen options={{ title: headerTitle }} />
      <View style={[styles.root, { backgroundColor: colors.background, padding: spacing.lg }]}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Course</Text>
        <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing.xs }]}>
          {title}
        </Text>
        <Text
          style={[typography.caption, { color: colors.textMuted, marginTop: spacing.lg }]}
        >
          ID
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          {id}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
