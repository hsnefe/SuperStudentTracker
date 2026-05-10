import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MOCK_WEEK_SCHEDULE_BLOCKS,
  WEEK_DAY_LABELS,
  WEEK_GRID_END_HOUR,
  WEEK_GRID_START_HOUR,
  type MockScheduleBlock,
  type SchedulePriority,
} from "@/constants/weekScheduleMock";
import { useTheme } from "@/hooks";

const SEGMENTS = ["Today", "Week", "Month", "Year"] as const;
const HOUR_ROW_PX = 46;
const COLLAPSED_GRID_MAX_HEIGHT = 320;

const TIMING = { duration: 280, easing: Easing.out(Easing.cubic) };

function gridMinutesRange(): { start: number; end: number; span: number } {
  const start = WEEK_GRID_START_HOUR * 60;
  const end = WEEK_GRID_END_HOUR * 60;
  return { start, end, span: end - start };
}

function priorityDotColor(priority: SchedulePriority, colors: ReturnType<typeof useTheme>["colors"]): string {
  switch (priority) {
    case "done":
      return colors.success;
    case "low":
      return colors.textMuted;
    case "medium":
      return colors.highlight;
    case "high":
      return colors.accent;
    case "break":
      return colors.textMuted;
    default:
      return colors.textMuted;
  }
}

function priorityLabel(priority: SchedulePriority): string {
  switch (priority) {
    case "done":
      return "Done";
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "break":
      return "Break";
    default:
      return "";
  }
}

function blockBackground(
  priority: SchedulePriority,
  colors: ReturnType<typeof useTheme>["colors"],
): string {
  switch (priority) {
    case "done":
      return "rgba(255,255,255,0.06)";
    case "low":
      return "rgba(255,255,255,0.05)";
    case "medium":
      return "rgba(255,101,63,0.22)";
    case "high":
      return "rgba(30,16,78,0.85)";
    case "break":
      return "rgba(255,255,255,0.04)";
    default:
      return colors.surface;
  }
}

function ScheduleTaskBlock({
  block,
  minuteSpan,
  layoutHeightPx,
}: {
  block: MockScheduleBlock;
  minuteSpan: number;
  layoutHeightPx: number;
}) {
  const { colors, typography, spacing, radius } = useTheme();
  const { start } = gridMinutesRange();
  const topMin = Math.max(0, block.startMinute - start);
  const botMin = Math.min(minuteSpan, block.endMinute - start);
  const durMin = Math.max(15, botMin - topMin);
  const topPx = (topMin / minuteSpan) * layoutHeightPx;
  const heightPx = Math.max((durMin / minuteSpan) * layoutHeightPx, 36);

  const dot = priorityDotColor(block.priority, colors);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.taskAbs,
        {
          top: topPx,
          height: heightPx,
          left: spacing.xs,
          right: spacing.xs,
          borderRadius: radius.sm,
          backgroundColor: blockBackground(block.priority, colors),
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: "hidden",
        },
      ]}
    >
      {block.priority === "break" ? (
        <LinearGradient
          colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)", "rgba(255,255,255,0.06)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View style={[styles.taskInner, { padding: spacing.sm, gap: spacing.xs }]}>
        <View style={styles.taskMetaRow}>
          <View style={styles.priorityRow}>
            <View style={[styles.priorityDot, { backgroundColor: dot }]} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {priorityLabel(block.priority)}
            </Text>
          </View>
          <View style={styles.iconMeta}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={[typography.caption, { color: colors.textMuted }]}>{block.durationLabel}</Text>
            <Ionicons name="chatbubble-outline" size={12} color={colors.textMuted} />
            <Text style={[typography.caption, { color: colors.textMuted }]}>{block.commentCount}</Text>
          </View>
        </View>
        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]} numberOfLines={2}>
          {block.title}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={2}>
          {block.description}
        </Text>
      </View>
    </View>
  );
}

function CurrentTimeLine({
  minuteSpan,
  layoutHeightPx,
}: {
  minuteSpan: number;
  layoutHeightPx: number;
}) {
  const { colors, typography } = useTheme();
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const d = new Date(nowTick);
  const mins = d.getHours() * 60 + d.getMinutes();
  const { start, end } = gridMinutesRange();
  if (mins < start || mins >= end) return null;

  const topPx = ((mins - start) / minuteSpan) * layoutHeightPx;
  const label = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  return (
    <View pointerEvents="none" style={[styles.nowLineWrap, { top: topPx }]}>
      <View style={[styles.nowBadge, { backgroundColor: colors.accent }]}>
        <Text style={[typography.caption, { color: "#ffffff", fontSize: 11 }]}>{label}</Text>
      </View>
      <View style={[styles.nowLine, { backgroundColor: colors.accent }]} />
    </View>
  );
}

function ScheduleGridBody({
  expanded,
  maxHeight,
}: {
  expanded: boolean;
  maxHeight?: number;
}) {
  const { colors, spacing } = useTheme();
  const { width: screenW } = useWindowDimensions();
  const hours: number[] = [];
  for (let h = WEEK_GRID_START_HOUR; h < WEEK_GRID_END_HOUR; h += 1) hours.push(h);

  const { span: minuteSpan } = gridMinutesRange();
  const layoutHeightPx = hours.length * HOUR_ROW_PX;
  const timeColumnWidth = 44;
  const contentWidth = Math.max(0, screenW - spacing.lg * 2 - timeColumnWidth);
  const dayColumnWidth = Math.max(contentWidth / WEEK_DAY_LABELS.length, 40);
  const columnsWidth = WEEK_DAY_LABELS.length * dayColumnWidth;

  const scrollVertical = (
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      style={maxHeight ? { maxHeight } : { flex: 1 }}
      contentContainerStyle={{ minHeight: layoutHeightPx }}
    >
      <View style={{ flexDirection: "row", minHeight: layoutHeightPx }}>
        <View style={[styles.timeCol, { width: 44 }]}>
          {hours.map((h) => (
            <View key={h} style={[styles.timeCell, { height: HOUR_ROW_PX }]}>
              <Text style={[styles.timeLabel, { color: colors.textMuted }]}>
                {`${String(h).padStart(2, "0")}:00`}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ width: columnsWidth, minHeight: layoutHeightPx, position: "relative" }}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {hours.map((h, idx) => (
              <View
                key={h}
                style={[
                  styles.hourBand,
                  {
                    top: idx * HOUR_ROW_PX,
                    height: HOUR_ROW_PX,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              />
            ))}
          </View>

          <View style={[styles.dayColumnsRow, { minHeight: layoutHeightPx }]}>
            {WEEK_DAY_LABELS.map((_, dayIdx) => (
              <View
                key={dayIdx}
                style={[
                  styles.dayColumn,
                  {
                    width: dayColumnWidth,
                    borderRightWidth: StyleSheet.hairlineWidth,
                    borderRightColor: colors.border,
                    minHeight: layoutHeightPx,
                  },
                ]}
              >
                {MOCK_WEEK_SCHEDULE_BLOCKS.filter((b) => b.dayIndex === dayIdx).map((b) => (
                  <ScheduleTaskBlock
                    key={b.id}
                    block={b}
                    minuteSpan={minuteSpan}
                    layoutHeightPx={layoutHeightPx}
                  />
                ))}
              </View>
            ))}
          </View>

          <CurrentTimeLine minuteSpan={minuteSpan} layoutHeightPx={layoutHeightPx} />
        </View>
      </View>
    </ScrollView>
  );

  if (expanded) {
    return (
      <View style={{ flex: 1, marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg }}>
        {scrollVertical}
      </View>
    );
  }

  return (
    <View style={{ marginHorizontal: -spacing.lg, maxHeight: maxHeight ?? COLLAPSED_GRID_MAX_HEIGHT }}>
      {scrollVertical}
    </View>
  );
}

function HeaderSegmentsRow({
  selectedSegment,
  onSelectSegment,
}: {
  selectedSegment: (typeof SEGMENTS)[number];
  onSelectSegment: (s: (typeof SEGMENTS)[number]) => void;
}) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <View style={[styles.headerRow, { marginBottom: spacing.sm }]}>
      <View style={styles.headerLeft}>
        <Text style={[typography.heading, { color: colors.textPrimary }]}>Schedule</Text>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => {}}
          style={({ pressed }) => [styles.filterBtn, { opacity: pressed ? 0.65 : 1 }]}
        >
          <Ionicons name="filter-outline" size={18} color={colors.textSecondary} />
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Filter</Text>
        </Pressable>
      </View>

      <View style={[styles.segmentWrap, { borderColor: colors.border, borderRadius: radius.sm }]}>
        {SEGMENTS.map((seg) => {
          const selected = seg === selectedSegment;
          return (
            <Pressable
              key={seg}
              accessibilityRole="button"
              onPress={() => onSelectSegment(seg)}
              style={[
                styles.segment,
                {
                  backgroundColor: selected ? "rgba(255,255,255,0.12)" : "transparent",
                  borderRadius: radius.sm - 2,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  { color: selected ? colors.textPrimary : colors.textMuted, fontWeight: selected ? "600" : "500" },
                ]}
              >
                {seg}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DayLabelsRow() {
  const { colors, typography, spacing } = useTheme();
  const { width: screenW } = useWindowDimensions();
  const timeColumnWidth = 44;
  const contentWidth = Math.max(0, screenW - spacing.lg * 2 - timeColumnWidth);
  const dayColumnWidth = Math.max(contentWidth / WEEK_DAY_LABELS.length, 40);
  const columnsWidth = WEEK_DAY_LABELS.length * dayColumnWidth;

  return (
    <View style={[styles.dayHeaderRow, { marginBottom: spacing.xs }]}>
      <View style={{ width: 44 }} />
      <View style={{ flexDirection: "row", width: columnsWidth }}>
        {WEEK_DAY_LABELS.map((d) => (
          <View key={d} style={[styles.dayHeadCell, { width: dayColumnWidth }]}>
            <Text style={[typography.caption, { color: colors.textMuted, fontWeight: "600" }]}>{d}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CardShell({
  children,
  expanded,
}: {
  children: ReactNode;
  expanded: boolean;
}) {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        expanded ? styles.shellExpanded : styles.shellCollapsed,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: expanded ? 0 : radius.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.lg,
          paddingTop: expanded ? spacing.lg + insets.top : spacing.lg,
          gap: spacing.sm,
          borderWidth: expanded ? 0 : 1,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function WeekScheduleCard() {
  const { colors, radius } = useTheme();
  const navigation = useNavigation();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const [expanded, setExpanded] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<(typeof SEGMENTS)[number]>("Week");

  const cardRef = useRef<View>(null);
  const measured = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const animX = useSharedValue(0);
  const animY = useSharedValue(0);
  const animW = useSharedValue(0);
  const animH = useSharedValue(0);
  const animR = useSharedValue(radius.lg);
  const backdropOp = useSharedValue(0);

  const shellAnimatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: animX.value,
    top: animY.value,
    width: animW.value,
    height: animH.value,
    borderRadius: animR.value,
    overflow: "hidden",
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
    opacity: backdropOp.value,
  }));

  const finishCollapse = useCallback(() => {
    setExpanded(false);
  }, []);

  const expandFromCard = useCallback(() => {
    cardRef.current?.measureInWindow((x, y, w, h) => {
      measured.current = { x, y, w, h };
      animX.value = x;
      animY.value = y;
      animW.value = w;
      animH.value = h;
      animR.value = radius.lg;
      backdropOp.value = 0;
      setExpanded(true);
      requestAnimationFrame(() => {
        animX.value = withTiming(0, TIMING);
        animY.value = withTiming(0, TIMING);
        animW.value = withTiming(screenW, TIMING);
        animH.value = withTiming(screenH, TIMING);
        animR.value = withTiming(0, TIMING);
        backdropOp.value = withTiming(1, TIMING);
      });
    });
    // Shared values (anim*, backdropOp) are stable refs from useSharedValue — omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shared values intentionally omitted
  }, [radius.lg, screenH, screenW]);

  const collapseToCard = useCallback(() => {
    const m = measured.current;
    backdropOp.value = withTiming(0, TIMING);
    animX.value = withTiming(m.x, TIMING);
    animY.value = withTiming(m.y, TIMING);
    animW.value = withTiming(m.w, TIMING);
    animH.value = withTiming(m.h, TIMING);
    animR.value = withTiming(radius.lg, TIMING, (finished) => {
      if (finished) runOnJS(finishCollapse)();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shared values intentionally omitted
  }, [finishCollapse, radius.lg]);

  useLayoutEffect(() => {
    const tabNav = navigation.getParent();
    if (!tabNav || typeof tabNav.setOptions !== "function") return;
    if (expanded) {
      tabNav.setOptions({
        tabBarStyle: { display: "none", height: 0 },
      });
    } else {
      tabNav.setOptions({ tabBarStyle: undefined });
    }
  }, [expanded, navigation]);

  useEffect(() => {
    return () => {
      const tabNav = navigation.getParent();
      if (tabNav && typeof tabNav.setOptions === "function") {
        tabNav.setOptions({ tabBarStyle: undefined });
      }
    };
  }, [navigation]);

  const onGridPress = useCallback(() => {
    if (expanded) collapseToCard();
    else expandFromCard();
  }, [collapseToCard, expandFromCard, expanded]);

  return (
    <>
      <View ref={cardRef} collapsable={false}>
        <CardShell expanded={false}>
          <HeaderSegmentsRow selectedSegment={selectedSegment} onSelectSegment={setSelectedSegment} />
          <Pressable
            accessibilityRole="button"
            onPress={onGridPress}
            style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
          >
            <DayLabelsRow />
            <ScheduleGridBody expanded={false} maxHeight={COLLAPSED_GRID_MAX_HEIGHT} />
          </Pressable>
        </CardShell>
      </View>

      <Modal visible={expanded} transparent animationType="none" statusBarTranslucent>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View pointerEvents="none" style={backdropStyle} />

          <Animated.View style={shellAnimatedStyle}>
            <View style={{ flex: 1, backgroundColor: colors.surface }}>
              <CardShell expanded>
                <HeaderSegmentsRow selectedSegment={selectedSegment} onSelectSegment={setSelectedSegment} />
                <Pressable
                  onPress={onGridPress}
                  style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.96 : 1 })}
                >
                  <DayLabelsRow />
                  <ScheduleGridBody expanded />
                </Pressable>
              </CardShell>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  shellCollapsed: {},
  shellExpanded: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  segmentWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
    maxWidth: "52%",
  },
  segment: {},
  dayHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayHeadCell: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  timeCol: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: "rgba(255,255,255,0.08)",
  },
  timeCell: {
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  hourBand: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  dayColumnsRow: {
    flexDirection: "row",
    position: "relative",
  },
  dayColumn: {
    position: "relative",
  },
  taskAbs: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  taskInner: {
    flex: 1,
  },
  taskMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  priorityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  iconMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nowLineWrap: {
    position: "absolute",
    left: 44,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20,
  },
  nowBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  nowLine: {
    flex: 1,
    height: 2,
    opacity: 0.95,
  },
});
