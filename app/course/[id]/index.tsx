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
import { CreateAssignmentModal } from "@/features/assignments/components/CreateAssignmentModal";
import { useCreateAssignment } from "@/features/assignments/hooks/useCreateAssignment";
import { EditCourseModal } from "@/features/courses/components/EditCourseModal";
import { useCourseForEdit } from "@/features/courses/hooks/useCourseForEdit";
import { useDeleteCourse } from "@/features/courses/hooks/useDeleteCourse";
import { useUpdateCourse } from "@/features/courses/hooks/useUpdateCourse";
import { loadAssignments } from "@/lib/persistence/courseAssignments";
import type { Assignment, CreateAssignmentInput, UpdateCourseInput } from "@/types";

export default function CourseDetailScreen() {
  const router = useRouter();
  const { id, title, activeSection, onSelectSection } = useCourseDetailTabs();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const heroLines = useMemo(() => splitCourseHeroTitle(title), [title]);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const createAssignment = useCreateAssignment();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const courseForEdit = useCourseForEdit(id, editModalVisible);

  const refreshAssignments = useCallback(() => {
    setAssignmentsLoading(true);
    loadAssignments(id).then((list) => {
      setAssignments(list);
      setAssignmentsLoading(false);
    });
  }, [id]);

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

  const handleCreateAssignment = async (input: CreateAssignmentInput) => {
    try {
      await createAssignment.mutateAsync(input);
      setCreateModalVisible(false);
      refreshAssignments();
    } catch {
      setCreateModalVisible(false);
    }
  };

  const activeTodos = useMemo(
    () =>
      assignments.reduce(
        (acc, a) => acc + a.tasks.filter((t) => !t.done).length,
        0,
      ),
    [assignments],
  );

  const assignmentCount = assignments.length;

  const closeEditModal = useCallback(() => {
    if (!updateCourse.isPending && !deleteCourse.isPending) {
      setEditModalVisible(false);
    }
  }, [deleteCourse.isPending, updateCourse.isPending]);

  const handleUpdateCourse = async (input: UpdateCourseInput) => {
    try {
      const result = await updateCourse.mutateAsync({ courseId: id, input });
      setEditModalVisible(false);
      router.setParams({ title: result.title });
    } catch {
      /* mutation error — modal stays open */
    }
  };

  const handleDeleteCourse = async () => {
    try {
      await deleteCourse.mutateAsync(id);
      setEditModalVisible(false);
      router.replace("/(tabs)/courses");
    } catch {
      /* mutation error */
    }
  };

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
                onEditPress={() => setEditModalVisible(true)}
              />
            }
          />

          <CourseAssignmentsBlurSection
            courseId={id}
            courseTitle={title}
            assignments={assignments}
            loading={assignmentsLoading}
            onAddPress={() => setCreateModalVisible(true)}
            style={{
              flex: 1,
              minHeight: courseAssignmentsMinHeightPx(windowHeight),
            }}
          />
        </View>
      </ScrollView>

      <CreateAssignmentModal
        visible={createModalVisible}
        busy={createAssignment.isPending}
        defaultCourseId={id}
        onClose={() => {
          if (!createAssignment.isPending) setCreateModalVisible(false);
        }}
        onSubmit={handleCreateAssignment}
      />

      <EditCourseModal
        visible={editModalVisible}
        busy={updateCourse.isPending || deleteCourse.isPending}
        loading={courseForEdit.isPending}
        loadError={courseForEdit.error}
        initial={courseForEdit.data}
        onClose={closeEditModal}
        onSubmit={handleUpdateCourse}
        onDelete={handleDeleteCourse}
      />
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
