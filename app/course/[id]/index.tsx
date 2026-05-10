import { useFocusEffect } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CourseAssignmentsBlurSection } from "@/components/course/CourseAssignmentsBlurSection";
import { CourseDetailAppBar } from "@/components/course/CourseDetailAppBar";
import { CourseHeroSection } from "@/components/course/CourseHeroSection";
import { splitCourseHeroTitle } from "@/components/course/courseHeroTitles";
import { courseAssignmentsMinHeightPx } from "@/constants/courseDetailVisual";
import { COURSE_HERO_MOCK_STAT } from "@/constants/courseHeroMock";
import { useCourseDetailTabs, useTheme } from "@/hooks";
import { loadAssignments } from "@/lib/persistence/courseAssignments";
import type { Assignment } from "@/types";

export default function CourseDetailScreen() {
  const router = useRouter();
  const { id, title, activeSection, onSelectSection } = useCourseDetailTabs();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const heroLines = useMemo(() => splitCourseHeroTitle(title), [title]);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setAssignmentsLoading(true);
      loadAssignments(id).then((list) => {
        if (!cancelled) {
          setAssignments(list);
          setAssignmentsLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [id]),
  );

  const activeTodos = useMemo(
    () =>
      assignments.reduce(
        (acc, a) => acc + a.tasks.filter((t) => !t.done).length,
        0,
      ),
    [assignments],
  );

  const assignmentCount = assignments.length;

  const openAddAssignment = useCallback(() => {
    router.push(`/course/${encodeURIComponent(id)}/assignment/add`);
  }, [id, router]);

  const openAssignment = useCallback(
    (a: Assignment) => {
      router.push(
        `/course/${encodeURIComponent(id)}/assignment/${encodeURIComponent(a.id)}?courseTitle=${encodeURIComponent(title)}`,
      );
    },
    [id, router, title],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <CourseHeroSection
            line1={heroLines.line1}
            line2={heroLines.line2}
            mockStat={COURSE_HERO_MOCK_STAT}
            activeTodos={activeTodos}
            assignmentCount={assignmentCount}
            assignmentsLoading={assignmentsLoading}
            appBar={
              <CourseDetailAppBar
                activeSection={activeSection}
                onSelectSection={onSelectSection}
              />
            }
          />

          <CourseAssignmentsBlurSection
            assignments={assignments}
            loading={assignmentsLoading}
            onOpenAssignment={openAssignment}
            onAddAssignment={openAddAssignment}
            style={{
              flex: 1,
              minHeight: courseAssignmentsMinHeightPx(windowHeight),
            }}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  column: {
    flexGrow: 1,
  },
});
