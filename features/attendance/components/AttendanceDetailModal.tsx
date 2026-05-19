import { useCallback, useEffect, useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { EXPAND_TRANSITION_MS } from "@/constants/navigationTransition";
import {
  formatAbsenceCountLabel,
  groupAbsencesByDate,
} from "@/lib/attendance";
import type { CourseAbsenceRecord } from "@/types";
import type { TransitionOriginRect } from "@/store/navigationTransitionStore";
import { useTheme } from "@/hooks";

const MODAL_BASE_MAX_WIDTH = 520;
const MODAL_MAX_WIDTH = MODAL_BASE_MAX_WIDTH * 3;

type Props = {
  visible: boolean;
  origin: TransitionOriginRect | null;
  records: CourseAbsenceRecord[];
  absenceToleranceHours: number;
  onClose: () => void;
};

export function AttendanceDetailModal({
  visible,
  origin,
  records,
  absenceToleranceHours,
  onClose,
}: Props) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { colors, spacing, typography, radius } = useTheme();

  const modalWidth = Math.min(screenW - 32, MODAL_MAX_WIDTH);
  const modalMaxHeight = Math.min(screenH * 0.88, 720);

  const finalLeft = (screenW - modalWidth) / 2;
  const finalTop = Math.max(16, (screenH - modalMaxHeight) / 2);

  const startLeft = origin?.x ?? finalLeft;
  const startTop = origin?.y ?? finalTop;
  const startWidth = origin?.width ?? modalWidth;
  const startHeight = origin?.height ?? 120;

  const progress = useSharedValue(visible ? 0 : 1);
  const backdropOpacity = useSharedValue(0);

  const finishClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const animateClose = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: EXPAND_TRANSITION_MS * 0.75 });
    progress.value = withTiming(
      0,
      { duration: EXPAND_TRANSITION_MS, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(finishClose)();
      },
    );
  }, [backdropOpacity, finishClose, progress]);

  useEffect(() => {
    if (!visible) return;
    progress.value = 0;
    backdropOpacity.value = 0;
    backdropOpacity.value = withTiming(1, { duration: EXPAND_TRANSITION_MS * 0.6 });
    progress.value = withTiming(1, {
      duration: EXPAND_TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, progress, backdropOpacity]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value * 0.45,
  }));

  const cardStyle = useAnimatedStyle(() => {
    const t = progress.value;
    return {
      position: "absolute",
      left: startLeft + (finalLeft - startLeft) * t,
      top: startTop + (finalTop - startTop) * t,
      width: startWidth + (modalWidth - startWidth) * t,
      maxHeight: startHeight + (modalMaxHeight - startHeight) * t,
      opacity: 0.92 + 0.08 * t,
      transform: [{ scale: 0.98 + 0.02 * t }],
    };
  });

  const groups = useMemo(() => groupAbsencesByDate(records), [records]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={animateClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={animateClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        <Animated.View
          style={[
            cardStyle,
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Text style={[typography.title, { color: colors.textPrimary }]}>Attendance</Text>

            <View style={[styles.summary, { marginTop: spacing.md, marginBottom: spacing.sm }]}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Total absence tolerance
              </Text>
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "700" }]}>
                {absenceToleranceHours}
              </Text>
            </View>

            <ScrollView
              style={{ maxHeight: modalMaxHeight - 140 }}
              contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.sm }}
              showsVerticalScrollIndicator
            >
              {groups.length === 0 ? (
                <Text style={[typography.body, { color: colors.textMuted }]}>
                  No absences recorded yet.
                </Text>
              ) : (
                groups.map((g) => (
                  <View
                    key={g.date}
                    style={[styles.row, { borderBottomColor: colors.border }]}
                  >
                    <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
                      {g.label}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {formatAbsenceCountLabel(g.count)}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={[styles.actions, { borderTopColor: colors.border, marginTop: spacing.md }]}>
              <Pressable
                onPress={animateClose}
                style={[styles.closeBtn, { borderColor: colors.border, borderRadius: radius.md }]}
                accessibilityRole="button"
              >
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Close</Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    overflow: "hidden",
  },
  summary: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
});
