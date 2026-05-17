import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { CourseGridCard, getCourseCardTotalHeight } from "@/components/CourseGridCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SimpleToast } from "@/components/SimpleToast";
import { MOCK_COURSES_FALLBACK } from "@/constants/coursesMock";
import {
  COURSE_GRID_HOVER_SCALE,
  COURSE_GRID_SCALE_PADDING_RATIO,
} from "@/constants/glassInteractionVisual";
import { useTheme } from "@/hooks";
import { useCoursesGridData } from "../hooks/useCoursesGridData";

const NUM_COLUMNS = 4;

export function CoursesScreen() {
  const { width } = useWindowDimensions();
  const { colors, spacing, typography } = useTheme();
  const query = useCoursesGridData();

  const [toastVisible, setToastVisible] = useState(false);
  const toastShownRef = useRef(false);

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
    if (query.isError) return MOCK_COURSES_FALLBACK;
    return query.data ?? [];
  }, [query.isPending, query.isError, query.data]);

  useEffect(() => {
    if (query.isError && !toastShownRef.current) {
      toastShownRef.current = true;
      setToastVisible(true);
    }
    if (query.isSuccess) {
      toastShownRef.current = false;
    }
  }, [query.isError, query.isSuccess]);

  const showEmptySuccess =
    query.isSuccess && !query.isError && (query.data?.length ?? 0) === 0;

  return (
    <View style={[styles.outer, { backgroundColor: colors.background }]}>
      <ScreenContainer scroll={false}>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Courses</Text>

        {query.isPending ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : showEmptySuccess ? (
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            No courses yet.
          </Text>
        ) : (
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
        )}
      </ScreenContainer>

      <SimpleToast
        visible={toastVisible}
        message="Could not load courses from the database. Showing sample courses."
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  loaderWrap: {
    flex: 1,
    minHeight: 160,
    justifyContent: "center",
    alignItems: "center",
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
