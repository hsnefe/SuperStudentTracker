import { useRouter } from "expo-router";
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
import { useTheme } from "@/hooks";
import { useCoursesGridData } from "../hooks/useCoursesGridData";

const NUM_COLUMNS = 4;

export function CoursesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors, spacing, typography } = useTheme();
  const query = useCoursesGridData();

  const [toastVisible, setToastVisible] = useState(false);
  const toastShownRef = useRef(false);

  const horizontalPadding = spacing.lg * 2;
  const gap = spacing.md;
  const innerWidth = Math.max(0, width - horizontalPadding);
  const cardWidth = Math.floor((innerWidth - gap * (NUM_COLUMNS - 1)) / NUM_COLUMNS);

  const rowMetrics = useMemo(() => {
    const cardHeight = getCourseCardTotalHeight(cardWidth, spacing.sm);
    const gridMaxHeight = cardHeight * 2 + gap * 2 + cardHeight * 0.3;
    return { gridMaxHeight };
  }, [cardWidth, gap, spacing.sm]);

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

  const handleCardPress = (id: string, title: string) => {
    const q = encodeURIComponent(title);
    router.push(`/course/${encodeURIComponent(id)}?title=${q}`);
  };

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
              contentContainerStyle={{ paddingBottom: spacing.md }}
            >
              <View style={[styles.wrapRow, { gap }]}>
                {displayCourses.map((course) => (
                  <CourseGridCard
                    key={course.id}
                    course={course}
                    width={cardWidth}
                    onPress={() => handleCardPress(course.id, course.title)}
                  />
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
    overflow: "hidden",
    marginTop: 4,
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    alignItems: "flex-start",
  },
});
