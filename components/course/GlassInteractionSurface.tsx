import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  GLASS_BORDER_GLOW_WIDTH,
  GLASS_BORDER_ROTATION_MS,
  GLASS_SHINE_SWEEP_MS,
} from "@/constants/glassInteractionVisual";

const SCALE_TIMING = { duration: 200, easing: Easing.out(Easing.cubic) };
const ACTIVE_SCALE = 1.02;
const DEFAULT_BLUR_INTENSITY = 32;

/** Narrow highlight band — reads as a thin ring when clipped to card corners. */
const BORDER_GRADIENT_COLORS = [
  "rgba(255,255,255,0)",
  "rgba(255,255,255,0)",
  "rgba(255,255,255,0.18)",
  "rgba(255,255,255,0.45)",
  "rgba(255,255,255,0.18)",
  "rgba(255,255,255,0)",
  "rgba(255,255,255,0)",
] as const;

export type GlassScaleMode = "uniform" | "hoverGrowPressShrink";

type Props = {
  /** Card background (gradient / tint). Blur applies behind this, not over children. */
  background?: ReactNode;
  /** Foreground content — always rendered above blur (stays sharp). */
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderRadius: number;
  interactive?: boolean;
  onPress?: () => void;
  enableScale?: boolean;
  scaleMode?: GlassScaleMode;
  hoverScale?: number;
  pressScale?: number;
  enableRotatingBorder?: boolean;
  enableShine?: boolean;
  borderGlowWidth?: number;
  enableBlur?: boolean;
  blurIntensity?: number;
  /** White frost over blur; lower keeps photos sharper. Default 0.08. */
  glassOverlayOpacity?: number;
  accessibilityLabel?: string;
};

function resolveTargetScale(
  scaleMode: GlassScaleMode,
  effectsActive: boolean,
  hovered: boolean,
  pressed: boolean,
  hoverScale: number,
  pressScale: number,
): number {
  if (!effectsActive && scaleMode === "uniform") return 1;
  if (scaleMode === "uniform") return ACTIVE_SCALE;
  if (pressed) return pressScale;
  if (hovered) return hoverScale;
  return 1;
}

export function GlassInteractionSurface({
  background,
  children,
  style,
  borderRadius,
  interactive = false,
  onPress,
  enableScale = false,
  scaleMode = "uniform",
  hoverScale = 1.06,
  pressScale = 0.985,
  enableRotatingBorder = false,
  enableShine = false,
  borderGlowWidth = GLASS_BORDER_GLOW_WIDTH,
  enableBlur = true,
  blurIntensity = DEFAULT_BLUR_INTENSITY,
  glassOverlayOpacity = 0.08,
  accessibilityLabel,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const effectsActive = hovered || pressed;

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const shineProgress = useSharedValue(0);

  useEffect(() => {
    if (!enableScale) return;
    const target = resolveTargetScale(
      scaleMode,
      effectsActive,
      hovered,
      pressed,
      hoverScale,
      pressScale,
    );
    scale.value = withTiming(target, SCALE_TIMING);
  }, [enableScale, scaleMode, effectsActive, hovered, pressed, hoverScale, pressScale, scale]);

  useEffect(() => {
    if (effectsActive && enableRotatingBorder) {
      rotation.value = 0;
      rotation.value = withRepeat(
        withTiming(360, {
          duration: GLASS_BORDER_ROTATION_MS,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = withTiming(0, { duration: 200 });
    }
  }, [effectsActive, enableRotatingBorder, rotation]);

  useEffect(() => {
    if (effectsActive && enableShine) {
      shineProgress.value = 0;
      shineProgress.value = withRepeat(
        withTiming(1, {
          duration: GLASS_SHINE_SWEEP_MS,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        false,
      );
    } else {
      cancelAnimation(shineProgress);
      shineProgress.value = 0;
    }
  }, [effectsActive, enableShine, shineProgress]);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedShineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${-40 + shineProgress.value * 180}%` }],
  }));

  const innerRadius = Math.max(0, borderRadius - borderGlowWidth);
  const showBorderRing = effectsActive && enableRotatingBorder;

  const innerShell = (
    <View
      style={[
        styles.shell,
        { borderRadius: innerRadius },
        effectsActive && styles.shellActive,
      ]}
    >
      {background ? (
        <View style={[styles.backgroundLayer, { borderRadius: innerRadius }]} pointerEvents="none">
          {background}
        </View>
      ) : null}

      {effectsActive && enableBlur ? (
        <View style={[styles.blurLayer, { borderRadius: innerRadius }]} pointerEvents="none">
          <BlurView
            intensity={blurIntensity}
            tint="dark"
            experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
            style={StyleSheet.absoluteFillObject}
          />
          <View
            style={[
              styles.glassOverlay,
              {
                borderRadius: innerRadius,
                backgroundColor: `rgba(255,255,255,${glassOverlayOpacity})`,
              },
            ]}
          />
        </View>
      ) : null}

      {effectsActive && enableShine ? (
        <Animated.View
          style={[styles.shineLayer, { borderRadius: innerRadius }, animatedShineStyle]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.38)",
              "rgba(255,255,255,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.35 }}
            style={styles.shineGradient}
          />
        </Animated.View>
      ) : null}

      <View style={styles.contentLayer}>{children}</View>
    </View>
  );

  const shell = (
    <Animated.View
      style={[
        styles.outer,
        { padding: borderGlowWidth, borderRadius: borderRadius + borderGlowWidth },
        enableScale && animatedScaleStyle,
        style,
      ]}
    >
      {showBorderRing ? (
        <Animated.View
          style={[styles.borderGlowRing, animatedRotationStyle]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[...BORDER_GRADIENT_COLORS]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      ) : null}
      {innerShell}
    </Animated.View>
  );

  if (!interactive) {
    return shell;
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {shell}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
    position: "relative",
  },
  borderGlowRing: {
    ...StyleSheet.absoluteFillObject,
  },
  shell: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.2)",
    flex: 1,
  },
  shellActive: {
    borderColor: "rgba(255,255,255,0.34)",
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blurLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 1,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.28)",
  },
  shineLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 2,
  },
  shineGradient: {
    width: "40%",
    height: "140%",
    marginTop: "-20%",
  },
  contentLayer: {
    zIndex: 3,
    position: "relative",
  },
});
