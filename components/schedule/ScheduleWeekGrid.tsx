import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import {
  WEEK_DAY_LABELS,
  WEEK_GRID_END_HOUR,
  WEEK_GRID_START_HOUR,
} from "@/constants/weekScheduleMock";
import { durationLabel, formatMinutesAsTime, weekdayToDayIndex } from "@/lib/scheduleTime";
import { useTheme } from "@/hooks";
import type { CreateCourseScheduleSlot } from "@/types";

export const SCHEDULE_HOUR_ROW_PX = 46;

export type ScheduleGridBlock = {
  id: string;
  dayIndex: number;
  startMinute: number;
  endMinute: number;
  title: string;
  durationLabelText: string;
};

export function scheduleSlotsToGridBlocks(slots: CreateCourseScheduleSlot[]): ScheduleGridBlock[] {
  return slots.map((s) => ({
    id: s.id,
    dayIndex: weekdayToDayIndex(s.weekday),
    startMinute: s.startMinutes,
    endMinute: s.endMinutes,
    title: s.location?.trim() ? s.location : formatMinutesAsTime(s.startMinutes),
    durationLabelText: durationLabel(s.startMinutes, s.endMinutes),
  }));
}

function gridMinutesRange(): { start: number; end: number; span: number } {
  const start = WEEK_GRID_START_HOUR * 60;
  const end = WEEK_GRID_END_HOUR * 60;
  return { start, end, span: end - start };
}

function ScheduleBlock({
  block,
  minuteSpan,
  layoutHeightPx,
  onPress,
  editable,
}: {
  block: ScheduleGridBlock;
  minuteSpan: number;
  layoutHeightPx: number;
  onPress?: (id: string) => void;
  editable?: boolean;
}) {
  const { colors, typography, spacing, radius } = useTheme();
  const { start } = gridMinutesRange();
  const topMin = Math.max(0, block.startMinute - start);
  const botMin = Math.min(minuteSpan, block.endMinute - start);
  const durMin = Math.max(15, botMin - topMin);
  const topPx = (topMin / minuteSpan) * layoutHeightPx;
  const heightPx = Math.max((durMin / minuteSpan) * layoutHeightPx, 32);

  const blockStyle = [
    styles.taskAbs,
    {
      top: topPx,
      height: heightPx,
      left: spacing.xs,
      right: spacing.xs,
      borderRadius: radius.sm,
      backgroundColor: "rgba(255,101,63,0.28)",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      padding: spacing.xs,
      justifyContent: "center" as const,
    },
  ];

  if (editable && onPress) {
    return (
      <Pressable
        onPress={() => onPress(block.id)}
        style={blockStyle}
        accessibilityRole="button"
      >
        <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: "600" }]} numberOfLines={2}>
          {block.title}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted, fontSize: 10 }]}>
          {block.durationLabelText}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={blockStyle}>
      <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: "600" }]} numberOfLines={2}>
        {block.title}
      </Text>
      <Text style={[typography.caption, { color: colors.textMuted, fontSize: 10 }]}>
        {block.durationLabelText}
      </Text>
    </View>
  );
}

export function ScheduleDayLabelsRow({
  horizontalPadding = 0,
  layoutWidth,
}: {
  horizontalPadding?: number;
  layoutWidth?: number;
}) {
  const { colors, typography, spacing } = useTheme();
  const { width: screenW } = useWindowDimensions();
  const timeColumnWidth = 44;
  const baseWidth = layoutWidth ?? screenW;
  const contentWidth = Math.max(0, baseWidth - horizontalPadding * 2 - timeColumnWidth);
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

type Props = {
  blocks: ScheduleGridBlock[];
  maxHeight?: number;
  editable?: boolean;
  onBlockPress?: (blockId: string) => void;
  onDayPress?: (dayIndex: number) => void;
  horizontalPadding?: number;
  layoutWidth?: number;
};

export function ScheduleWeekGrid({
  blocks,
  maxHeight = 220,
  editable,
  onBlockPress,
  onDayPress,
  horizontalPadding = 0,
  layoutWidth,
}: Props) {
  const { colors } = useTheme();
  const { width: screenW } = useWindowDimensions();
  const hours: number[] = [];
  for (let h = WEEK_GRID_START_HOUR; h < WEEK_GRID_END_HOUR; h += 1) hours.push(h);

  const { span: minuteSpan } = gridMinutesRange();
  const layoutHeightPx = hours.length * SCHEDULE_HOUR_ROW_PX;
  const timeColumnWidth = 44;
  const baseWidth = layoutWidth ?? screenW;
  const contentWidth = Math.max(0, baseWidth - horizontalPadding * 2 - timeColumnWidth);
  const dayColumnWidth = Math.max(contentWidth / WEEK_DAY_LABELS.length, 40);
  const columnsWidth = WEEK_DAY_LABELS.length * dayColumnWidth;

  return (
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      style={{ maxHeight }}
      contentContainerStyle={{ minHeight: layoutHeightPx }}
    >
      <View style={{ flexDirection: "row", minHeight: layoutHeightPx }}>
        <View style={[styles.timeCol, { width: 44, borderRightColor: colors.border }]}>
          {hours.map((h) => (
            <View key={h} style={[styles.timeCell, { height: SCHEDULE_HOUR_ROW_PX }]}>
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
                    top: idx * SCHEDULE_HOUR_ROW_PX,
                    height: SCHEDULE_HOUR_ROW_PX,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              />
            ))}
          </View>

          <View style={[styles.dayColumnsRow, { minHeight: layoutHeightPx }]}>
            {WEEK_DAY_LABELS.map((_, dayIdx) => (
              <Pressable
                key={dayIdx}
                disabled={!editable || !onDayPress}
                onPress={() => onDayPress?.(dayIdx)}
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
                {blocks
                  .filter((b) => b.dayIndex === dayIdx)
                  .map((b) => (
                    <ScheduleBlock
                      key={b.id}
                      block={b}
                      minuteSpan={minuteSpan}
                      layoutHeightPx={layoutHeightPx}
                      editable={editable}
                      onPress={onBlockPress}
                    />
                  ))}
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
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
});
