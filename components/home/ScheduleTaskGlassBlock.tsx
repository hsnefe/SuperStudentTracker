import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { GlassInteractionSurface } from "@/components/course/GlassInteractionSurface";
import {
  ScheduleTaskBlockFace,
  blockBackground,
  computeBlockLayout,
} from "@/components/home/scheduleBlockShared";
import { COURSE_GRID_PRESS_SCALE } from "@/constants/glassInteractionVisual";
import type { MockScheduleBlock } from "@/constants/weekScheduleMock";
import { useTheme } from "@/hooks";

const HOVER_SCALE = 1.02;

type Props = {
  block: MockScheduleBlock;
  minuteSpan: number;
  layoutHeightPx: number;
};

export function ScheduleTaskGlassBlock({ block, minuteSpan, layoutHeightPx }: Props) {
  const { colors, spacing, radius } = useTheme();
  const [hovered, setHovered] = useState(false);
  const { topPx, heightPx } = computeBlockLayout(block, minuteSpan, layoutHeightPx);
  const bgColor = blockBackground(block.priority, colors);

  return (
    <View
      style={[
        styles.taskAbs,
        {
          top: topPx,
          height: heightPx,
          left: spacing.xs,
          right: spacing.xs,
          zIndex: hovered ? 10 : 1,
        },
      ]}
    >
      <GlassInteractionSurface
        borderRadius={radius.sm}
        interactive
        enableScale
        scaleMode="hoverGrowPressShrink"
        hoverScale={HOVER_SCALE}
        pressScale={COURSE_GRID_PRESS_SCALE}
        enableBlur={false}
        onHoverChange={setHovered}
        style={{ flex: 1, minHeight: heightPx }}
        background={
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: bgColor,
                borderRadius: radius.sm,
              },
            ]}
          />
        }
        accessibilityLabel={block.title}
      >
        <View style={{ flex: 1, overflow: "hidden", borderRadius: radius.sm }}>
          <ScheduleTaskBlockFace block={block} />
        </View>
      </GlassInteractionSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  taskAbs: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
