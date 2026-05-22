import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { GlassInteractionSurface } from "@/components/course/GlassInteractionSurface";
import {
  ScheduleTaskBlockFace,
  blockBackground,
  computeBlockLayout,
} from "@/components/home/scheduleBlockShared";
import type { HomeScheduleBlock } from "@/constants/homeSchedule";
import {
  SCHEDULE_HOVER_LIFT_PX,
  SCHEDULE_STACK_PX,
  type StackedHomeScheduleBlock,
} from "@/lib/scheduleOverlap";
import { useTheme } from "@/hooks";

const LIFT_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) };

type Props = {
  block: HomeScheduleBlock | StackedHomeScheduleBlock;
  minuteSpan: number;
  layoutHeightPx: number;
  stackIndex?: number;
  stackSize?: number;
};

export function ScheduleTaskGlassBlock({
  block,
  minuteSpan,
  layoutHeightPx,
  stackIndex = 0,
  stackSize = 1,
}: Props) {
  const { colors, spacing, radius } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const { topPx, heightPx } = computeBlockLayout(block, minuteSpan, layoutHeightPx);
  const bgColor = blockBackground(block.priority, colors);

  const isActive = hovered || pressed;
  const isTopOfStack = stackIndex === stackSize - 1;
  const shouldLift = isActive && stackSize > 1 && isTopOfStack;

  const stackOffset = useSharedValue(stackIndex * SCHEDULE_STACK_PX);
  const liftOffset = useSharedValue(0);

  useEffect(() => {
    stackOffset.value = withTiming(stackIndex * SCHEDULE_STACK_PX, LIFT_TIMING);
  }, [stackIndex, stackOffset]);

  useEffect(() => {
    const liftAmount = shouldLift
      ? -Math.min(SCHEDULE_HOVER_LIFT_PX, (stackSize - 1) * SCHEDULE_STACK_PX * 4)
      : 0;
    liftOffset.value = withTiming(liftAmount, LIFT_TIMING);
  }, [shouldLift, stackSize, liftOffset]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: stackOffset.value + liftOffset.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.taskAbs,
        containerStyle,
        {
          top: topPx,
          height: heightPx,
          left: spacing.xs,
          right: spacing.xs,
          zIndex: isActive ? 100 + stackIndex : stackIndex + 1,
        },
      ]}
    >
      <Pressable
        style={{ flex: 1, minHeight: heightPx }}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
      >
      <GlassInteractionSurface
        borderRadius={radius.sm}
        interactive={false}
        enableScale={false}
        enableBlur={false}
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
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  taskAbs: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
