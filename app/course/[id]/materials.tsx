import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CourseDetailAppBar } from "@/components/course/CourseDetailAppBar";
import { useCourseDetailTabs, useTheme } from "@/hooks";

export default function CourseMaterialsScreen() {
  const { activeSection, onSelectSection } = useCourseDetailTabs();
  const { colors, typography, spacing } = useTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <CourseDetailAppBar activeSection={activeSection} onSelectSection={onSelectSection} />
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
          <Text style={[typography.heading, { color: colors.textPrimary }]}>Materials</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            Course materials will appear here.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
