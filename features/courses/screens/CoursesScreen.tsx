import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { CourseGridCard, getCourseCardTotalHeight } from "@/components/CourseGridCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SimpleToast } from "@/components/SimpleToast";
import type { CourseGridItem } from "@/constants/coursesMock";
import { MOCK_COURSES_FALLBACK } from "@/constants/coursesMock";
import {
  COURSE_GRID_HOVER_SCALE,
  COURSE_GRID_SCALE_PADDING_RATIO,
} from "@/constants/glassInteractionVisual";
import { useTheme } from "@/hooks";
import type { CreateCourseInput } from "@/types";
import { CreateCourseModal } from "../components/CreateCourseModal";
import { useCreateCourse } from "../hooks/useCreateCourse";
import { useCoursesGridData } from "../hooks/useCoursesGridData";

const NUM_COLUMNS = 4;

function nextLocalCourseId() {
  return `local-${Date.now()}`;
}

export function CoursesScreen() {
  const { width } = useWindowDimensions();
  const { colors, spacing, typography } = useTheme();
  const query = useCoursesGridData();
  const createCourse = useCreateCourse();

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastShownRef = useRef(false);
  const [localCourses, setLocalCourses] = useState<CourseGridItem[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const horizontalPadding = spacing.lg * 2;
  const gap = spacing.md;
  const innerWidth = Math.max(0, width - horizontalPadding);
  const columnWidth = Math.floor((innerWidth - gap * (NUM_COLUMNS - 1)) / NUM_COLUMNS);
  const cardScalePadding = Math.ceil(columnWidth * COURSE_GRID_SCALE_PADDING_RATIO);
  const cardWidth = columnWidth - cardScalePadding * 2;

  const rowMetrics = useMemo(() => {
    const cardHeight = getCourseCardTotalHeight(cardWidth, spacing.sm);
    const hoverOverflow = Math.ceil(cardHeight * (COURSE_GRID_HOVER_SCALE - 1));
    const gridMaxHeight =
      cardHeight * 2 + gap * 2 + cardHeight * 0.3 + hoverOverflow + cardScalePadding * 2;
    return { gridMaxHeight, cardScalePadding, columnWidth };
  }, [cardWidth, gap, spacing.sm, cardScalePadding]);

  const displayCourses = useMemo(() => {
    if (query.isPending) return [];
    const base = query.isError ? MOCK_COURSES_FALLBACK : (query.data ?? []);
    return [...base, ...localCourses];
  }, [query.isPending, query.isError, query.data, localCourses]);

  useEffect(() => {
    if (query.isError && !toastShownRef.current) {
      toastShownRef.current = true;
      setToastMessage("Could not load courses from the database. Showing sample courses.");
      setToastVisible(true);
    }
    if (query.isSuccess) {
      toastShownRef.current = false;
    }
  }, [query.isError, query.isSuccess]);

  const showEmptySuccess =
    query.isSuccess &&
    !query.isError &&
    (query.data?.length ?? 0) === 0 &&
    localCourses.length === 0;

  const openCreateModal = () => {
    setCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    if (createCourse.isPending) return;
    setCreateModalVisible(false);
  };

  const handleCreateCourse = async (input: CreateCourseInput) => {
    try {
      await createCourse.mutateAsync(input);
      closeCreateModal();
    } catch {
      const local: CourseGridItem = {
        id: nextLocalCourseId(),
        title: input.title.trim(),
        imageUrl: null,
        assignmentCount: 0,
      };
      setLocalCourses((prev) => [...prev, local]);
      setToastMessage(
        "Ders yalnızca yerel olarak kaydedildi (başlık). Program, notlar ve Firebase için bağlantı gerekir.",
      );
      setToastVisible(true);
      closeCreateModal();
    }
  };

  const showGrid = !query.isPending && (displayCourses.length > 0 || !showEmptySuccess);

  return (
    <View style={[styles.outer, { backgroundColor: colors.background }]}>
      <ScreenContainer scroll={false}>
        <View style={styles.titleRow}>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Courses</Text>
          <Pressable
            onPress={openCreateModal}
            accessibilityRole="button"
            accessibilityLabel="Add course"
            hitSlop={12}
            style={[
              styles.addButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="add" size={26} color={colors.accent} />
          </Pressable>
        </View>

        {query.isPending ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : showEmptySuccess ? (
          <View style={styles.emptyWrap}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              No courses yet.
            </Text>
            <Pressable
              onPress={openCreateModal}
              style={[styles.emptyAddBtn, { backgroundColor: colors.accent }]}
              accessibilityRole="button"
            >
              <Text style={[typography.caption, styles.emptyAddLabel]}>Add your first course</Text>
            </Pressable>
          </View>
        ) : showGrid ? (
          <View style={[styles.gridClip, { maxHeight: rowMetrics.gridMaxHeight }]}>
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingTop: rowMetrics.cardScalePadding,
                paddingBottom: spacing.md + rowMetrics.cardScalePadding,
              }}
            >
              <View style={[styles.wrapRow, { gap }]}>
                {displayCourses.map((course) => (
                  <View
                    key={course.id}
                    style={{
                      width: rowMetrics.columnWidth,
                      padding: rowMetrics.cardScalePadding,
                    }}
                  >
                    <CourseGridCard
                      course={course}
                      width={cardWidth}
                      href={{
                        pathname: "/course/[id]",
                        params: {
                          id: course.id,
                          title: course.title,
                        },
                      }}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : null}
      </ScreenContainer>

      <CreateCourseModal
        visible={createModalVisible}
        busy={createCourse.isPending}
        onClose={closeCreateModal}
        onSubmit={handleCreateCourse}
      />

      <SimpleToast
        visible={toastVisible}
        message={toastMessage}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  loaderWrap: {
    flex: 1,
    minHeight: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyWrap: {
    gap: 16,
    paddingTop: 8,
  },
  emptyAddBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  emptyAddLabel: {
    color: "#fff",
    fontWeight: "700",
  },
  gridClip: {
    overflow: "visible",
    marginTop: 4,
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    alignItems: "flex-start",
  },
});
