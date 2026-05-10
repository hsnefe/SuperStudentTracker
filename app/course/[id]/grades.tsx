import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CourseDetailAppBar } from "@/components/course/CourseDetailAppBar";
import { CourseGradeBreakdownCard } from "@/components/CourseGradeBreakdownCard";
import { getMockGradeRowsForCourse } from "@/constants/courseDetailMock";
import { useCourseDetailTabs, useTheme } from "@/hooks";

export default function CourseGradesScreen() {
  const { id, activeSection, onSelectSection } = useCourseDetailTabs();
  const { colors, spacing } = useTheme();

  const gradeRows = useMemo(() => getMockGradeRowsForCourse(id), [id]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <CourseDetailAppBar activeSection={activeSection} onSelectSection={onSelectSection} />
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
          showsVerticalScrollIndicator={false}
        >
          <CourseGradeBreakdownCard courseId={id} initialRows={gradeRows} />
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
