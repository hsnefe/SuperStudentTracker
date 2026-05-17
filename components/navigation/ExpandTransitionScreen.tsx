import type { ReactNode } from "react";
import { useEffect } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { EXPAND_TRANSITION_MS } from "@/constants/navigationTransition";
import { useNavigationTransitionStore } from "@/store/navigationTransitionStore";

type Props = {
  children: ReactNode;
};

export function ExpandTransitionScreen({ children }: Props) {
  const origin = useNavigationTransitionStore((s) => s.origin);
  const clearOrigin = useNavigationTransitionStore((s) => s.clearOrigin);
  const { width: screenW, height: screenH } = useWindowDimensions();

  const progress = useSharedValue(origin ? 0 : 1);
  const pivotX = useSharedValue(screenW / 2);
  const pivotY = useSharedValue(screenH / 2);
  const startScale = useSharedValue(1);
  const hasOrigin = useSharedValue(origin ? 1 : 0);

  useEffect(() => {
    if (!origin) {
      hasOrigin.value = 0;
      progress.value = 1;
      return;
    }

    const cx = origin.x + origin.width / 2;
    const cy = origin.y + origin.height / 2;
    const minScale = Math.max(
      origin.width / screenW,
      origin.height / screenH,
      0.04,
    );

    pivotX.value = cx;
    pivotY.value = cy;
    startScale.value = minScale;
    hasOrigin.value = 1;
    progress.value = 0;
    progress.value = withTiming(
      1,
      {
        duration: EXPAND_TRANSITION_MS,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(clearOrigin)();
        }
      },
    );
  }, [
    origin,
    screenW,
    screenH,
    progress,
    pivotX,
    pivotY,
    startScale,
    hasOrigin,
    clearOrigin,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    if (hasOrigin.value === 0) {
      return { opacity: 1 };
    }

    const scale = startScale.value + (1 - startScale.value) * progress.value;
    const translateX = (pivotX.value - screenW / 2) * (1 - progress.value);
    const translateY = (pivotY.value - screenH / 2) * (1 - progress.value);

    return {
      opacity: 0.92 + 0.08 * progress.value,
      transform: [{ translateX }, { translateY }, { scale }],
    };
  });

  return (
    <Animated.View style={[styles.root, animatedStyle]}>{children}</Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
