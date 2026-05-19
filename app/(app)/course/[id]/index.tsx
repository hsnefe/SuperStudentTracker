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
import { useCourseDetailTabs, useTheme } from "@/hooks";
import { AttendanceDetailModal } from "@/features/attendance";
import { CreateAssignmentModal } from "@/features/assignments/components/CreateAssignmentModal";
import { useCreateAssignment } from "@/features/assignments/hooks/useCreateAssignment";
import { EditCourseModal } from "@/features/courses/components/EditCourseModal";
import { fetchCourseForEdit } from "@/features/courses/api/fetchCourseForEdit";
import { useCourseForEdit } from "@/features/courses/hooks/useCourseForEdit";
import { useDeleteCourse } from "@/features/courses/hooks/useDeleteCourse";
import { useUpdateCourse } from "@/features/courses/hooks/useUpdateCourse";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  addAbsenceToday,
  canAddAbsenceToday,
  formatAbsenceCaption,
  formatPercentLabel,
} from "@/lib/attendance";
import { loadCourseAttendance, saveCourseAttendance } from "@/lib/persistence/courseAttendance";
import { loadAssignments } from "@/lib/persistence/courseAssignments";
import type { TransitionOriginRect } from "@/store/navigationTransitionStore";
import type {
  Assignment,
  CourseAbsenceRecord,
  CreateAssignmentInput,
  ScheduleSlot,
  UpdateCourseInput,
} from "@/types";

export default function CourseDetailScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { id, title, activeSection, onSelectSection } = useCourseDetailTabs();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const heroLines = useMemo(() => splitCourseHeroTitle(title), [title]);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [absenceRecords, setAbsenceRecords] = useState<CourseAbsenceRecord[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [absenceToleranceHours, setAbsenceToleranceHours] = useState(0);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [expandOrigin, setExpandOrigin] = useState<TransitionOriginRect | null>(null);
  const createAssignment = useCreateAssignment();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const courseForEdit = useCourseForEdit(id, editModalVisible);

  const refreshAssignments = useCallback(() => {
    if (!user) return;
    setAssignmentsLoading(true);
    loadAssignments(user.uid, id).then((list) => {
      setAssignments(list);
      setAssignmentsLoading(false);
    });
  }, [id, user]);

  const refreshAttendance = useCallback(async () => {
    if (!user) return;
    const [records, courseData] = await Promise.all([
      loadCourseAttendance(user.uid, id),
      fetchCourseForEdit(user.uid, id).catch(() => null),
    ]);
    setAbsenceRecords(records);
    if (courseData) {
      setAbsenceToleranceHours(courseData.absenceToleranceHours);
      setScheduleSlots(
        courseData.scheduleSlots.map((s) => ({
          ...s,
          courseId: id,
        })),
      );
    }
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;
      setAssignmentsLoading(true);
      Promise.all([
        loadAssignments(user.uid, id),
        loadCourseAttendance(user.uid, id),
        fetchCourseForEdit(user.uid, id).catch(() => null),
      ]).then(([list, records, courseData]) => {
        if (cancelled) return;
        setAssignments(list);
        setAssignmentsLoading(false);
        setAbsenceRecords(records);
        if (courseData) {
          setAbsenceToleranceHours(courseData.absenceToleranceHours);
          setScheduleSlots(
            courseData.scheduleSlots.map((s) => ({
              ...s,
              courseId: id,
            })),
          );
        }
      });
      return () => {
        cancelled = true;
      };
    }, [id, user]),
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

  const absenceCount = absenceRecords.length;
  const percentLabel = formatPercentLabel(absenceCount, absenceToleranceHours);
  const absenceCaption = formatAbsenceCaption(absenceCount, absenceToleranceHours);
  const canAddToday = useMemo(
    () => canAddAbsenceToday(scheduleSlots, absenceRecords),
    [scheduleSlots, absenceRecords],
  );

  const handleAddAbsenceToday = useCallback(async () => {
    if (!user || !canAddAbsenceToday(scheduleSlots, absenceRecords)) return;
    const next = addAbsenceToday(absenceRecords, id);
    setAbsenceRecords(next);
    await saveCourseAttendance(user.uid, id, next);
  }, [absenceRecords, id, scheduleSlots, user]);

  const handleAttendanceCardPress = useCallback((origin: TransitionOriginRect) => {
    setExpandOrigin(origin);
    setAttendanceModalVisible(true);
  }, []);

  const handleAttendanceModalClose = useCallback(() => {
    setAttendanceModalVisible(false);
    setExpandOrigin(null);
  }, []);

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
      void refreshAttendance();
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
            attendanceStat={{
              percentLabel,
              caption: absenceCaption,
              canAddToday,
              onCardPress: handleAttendanceCardPress,
              onAddPress: () => void handleAddAbsenceToday(),
            }}
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

      <AttendanceDetailModal
        visible={attendanceModalVisible}
        origin={expandOrigin}
        records={absenceRecords}
        absenceToleranceHours={absenceToleranceHours}
        onClose={handleAttendanceModalClose}
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
