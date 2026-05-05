import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { CourseAssignmentsSection } from "@/components/CourseAssignmentsSection";
import { CourseGradeBreakdownCard } from "@/components/CourseGradeBreakdownCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { getMockGradeRowsForCourse } from "@/constants/courseDetailMock";
import { useMemo } from "react";
import { useTheme } from "@/hooks";

export default function CourseDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[]; title?: string | string[] }>();
  const { spacing } = useTheme();

  const idRaw = params.id;
  const titleRaw = params.title;
  const id = Array.isArray(idRaw) ? idRaw[0] : idRaw ?? "";
  const titleParam = Array.isArray(titleRaw) ? titleRaw[0] : titleRaw;
  const title =
    typeof titleParam === "string" && titleParam.length > 0 ? titleParam : "Course";

  const headerTitle = title.length > 42 ? `${title.slice(0, 42)}…` : title;

  const gradeRows = useMemo(() => getMockGradeRowsForCourse(id), [id]);

  return (
    <>
      <Stack.Screen options={{ title: headerTitle }} />
      <ScreenContainer>
        <View style={{ gap: spacing.md }}>
          <View style={[styles.courseTitleBlock, { gap: spacing.xs }]}>
            <CourseGradeBreakdownCard key={id} courseId={id} initialRows={gradeRows} />
          </View>
          <CourseAssignmentsSection courseId={id} courseTitle={title} />
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  courseTitleBlock: {},
});
