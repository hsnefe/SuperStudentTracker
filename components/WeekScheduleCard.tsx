import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import {
  HomeScheduleBlurSection,
  type ScheduleSegment,
} from "@/components/home/HomeScheduleBlurSection";
import { ScheduleTaskGlassBlock } from "@/components/home/ScheduleTaskGlassBlock";
import { gridMinutesRange } from "@/components/home/scheduleBlockShared";
import type { HomeScheduleBlock } from "@/constants/homeSchedule";
import {
  HOME_BLUR_BORDER_RADIUS,
  HOME_GRID_LINE_COLOR,
  HOME_LABEL_MUTED,
  HOME_SCHEDULE_NOW_COLOR,
  HOME_SECTION_TITLE_COLOR,
} from "@/constants/homeBlurVisual";
import {
  WEEK_DAY_LABELS,
  WEEK_GRID_END_HOUR,
  WEEK_GRID_START_HOUR,
} from "@/constants/weekScheduleMock";
import { useHomeSchedule } from "@/features/home/hooks/useHomeSchedule";
import { assignOverlapStacks, type StackedHomeScheduleBlock } from "@/lib/scheduleOverlap";
import { useTheme } from "@/hooks";

const HOUR_ROW_PX = 46;
const COLLAPSED_GRID_MAX_HEIGHT = 320;

const TIMING = { duration: 280, easing: Easing.out(Easing.cubic) };

function CurrentTimeLine({
  minuteSpan,
  layoutHeightPx,
}: {
  minuteSpan: number;
  layoutHeightPx: number;
}) {
  const { typography } = useTheme();
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
      <View style={[styles.nowBadge, { backgroundColor: HOME_SCHEDULE_NOW_COLOR }]}>
        <Text style={[typography.caption, { color: "#0f1115", fontSize: 11, fontWeight: "700" }]}>
          {label}
        </Text>
      </View>
      <View style={[styles.nowLine, { backgroundColor: HOME_SCHEDULE_NOW_COLOR }]} />
    </View>
  );
}

type ScheduleGridBodyProps = {
  expanded: boolean;
  maxHeight?: number;
  blocks: HomeScheduleBlock[];
  loading: boolean;
};

function ScheduleGridBody({ expanded, maxHeight, blocks, loading }: ScheduleGridBodyProps) {
  const { spacing, typography } = useTheme();
  const { width: screenW } = useWindowDimensions();
  const hours: number[] = [];
  for (let h = WEEK_GRID_START_HOUR; h < WEEK_GRID_END_HOUR; h += 1) hours.push(h);

  const { span: minuteSpan } = gridMinutesRange();
  const layoutHeightPx = hours.length * HOUR_ROW_PX;
  const timeColumnWidth = 44;
  const contentWidth = Math.max(0, screenW - spacing.lg * 2 - timeColumnWidth);
  const dayColumnWidth = Math.max(contentWidth / WEEK_DAY_LABELS.length, 40);
  const columnsWidth = WEEK_DAY_LABELS.length * dayColumnWidth;

  const blocksByDay = useMemo(() => {
    const byDay: StackedHomeScheduleBlock[][] = Array.from({ length: WEEK_DAY_LABELS.length }, () => []);
    for (let dayIdx = 0; dayIdx < WEEK_DAY_LABELS.length; dayIdx += 1) {
      const dayBlocks = blocks.filter((b) => b.dayIndex === dayIdx);
      byDay[dayIdx] = assignOverlapStacks(dayBlocks);
    }
    return byDay;
  }, [blocks]);

  if (loading) {
    return (
      <ActivityIndicator
        color={HOME_SECTION_TITLE_COLOR}
        style={{ paddingVertical: spacing.lg, alignSelf: "center" }}
      />
    );
  }

  if (blocks.length === 0) {
    return (
      <Text style={[typography.body, { color: HOME_LABEL_MUTED, paddingVertical: spacing.md }]}>
        No classes scheduled this week.
      </Text>
    );
  }

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
              <Text style={[styles.timeLabel, { color: HOME_LABEL_MUTED }]}>
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
                    borderBottomColor: HOME_GRID_LINE_COLOR,
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
                    borderRightColor: HOME_GRID_LINE_COLOR,
                    minHeight: layoutHeightPx,
                  },
                ]}
              >
                {blocksByDay[dayIdx].map((b) => (
                  <ScheduleTaskGlassBlock
                    key={b.id}
                    block={b}
                    minuteSpan={minuteSpan}
                    layoutHeightPx={layoutHeightPx}
                    stackIndex={b.stackIndex}
                    stackSize={b.stackSize}
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

function DayLabelsRow() {
  const { typography, spacing } = useTheme();
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
            <Text style={[typography.caption, { color: HOME_LABEL_MUTED, fontWeight: "600" }]}>
              {d}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function WeekScheduleCard() {
  const navigation = useNavigation();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { blocks, loading } = useHomeSchedule();

  const [expanded, setExpanded] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<ScheduleSegment>("Week");

  const cardRef = useRef<View>(null);
  const measured = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const animX = useSharedValue(0);
  const animY = useSharedValue(0);
  const animW = useSharedValue(0);
  const animH = useSharedValue(0);
  const animR = useSharedValue(HOME_BLUR_BORDER_RADIUS);
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
      animR.value = HOME_BLUR_BORDER_RADIUS;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shared values intentionally omitted
  }, [screenH, screenW]);

  const collapseToCard = useCallback(() => {
    const m = measured.current;
    backdropOp.value = withTiming(0, TIMING);
    animX.value = withTiming(m.x, TIMING);
    animY.value = withTiming(m.y, TIMING);
    animW.value = withTiming(m.w, TIMING);
    animH.value = withTiming(m.h, TIMING);
    animR.value = withTiming(HOME_BLUR_BORDER_RADIUS, TIMING, (finished) => {
      if (finished) runOnJS(finishCollapse)();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shared values intentionally omitted
  }, [finishCollapse]);

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
    if (loading || blocks.length === 0) return;
    if (expanded) collapseToCard();
    else expandFromCard();
  }, [blocks.length, collapseToCard, expandFromCard, expanded, loading]);

  const renderGrid = (fullScreen: boolean) => (
    <Pressable
      accessibilityRole="button"
      onPress={onGridPress}
      disabled={loading || blocks.length === 0}
      style={({ pressed }) => ({
        opacity: pressed && blocks.length > 0 ? 0.92 : 1,
        flex: fullScreen ? 1 : undefined,
      })}
    >
      <DayLabelsRow />
      <ScheduleGridBody
        expanded={fullScreen}
        maxHeight={fullScreen ? undefined : COLLAPSED_GRID_MAX_HEIGHT}
        blocks={blocks}
        loading={loading}
      />
    </Pressable>
  );

  return (
    <>
      <View ref={cardRef} collapsable={false}>
        <HomeScheduleBlurSection
          selectedSegment={selectedSegment}
          onSelectSegment={setSelectedSegment}
        >
          {renderGrid(false)}
        </HomeScheduleBlurSection>
      </View>

      <Modal visible={expanded} transparent animationType="none" statusBarTranslucent>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View pointerEvents="none" style={backdropStyle} />

          <Animated.View style={shellAnimatedStyle}>
            <HomeScheduleBlurSection
              expanded
              selectedSegment={selectedSegment}
              onSelectSegment={setSelectedSegment}
              style={{ flex: 1 }}
            >
              {renderGrid(true)}
            </HomeScheduleBlurSection>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
    borderRightColor: HOME_GRID_LINE_COLOR,
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
