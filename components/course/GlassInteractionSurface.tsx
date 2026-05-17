import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const SCALE_TIMING = { duration: 200, easing: Easing.out(Easing.cubic) };
const ACTIVE_SCALE = 1.02;
const DEFAULT_BLUR_INTENSITY = 32;

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
  blurIntensity?: number;
  accessibilityLabel?: string;
};

export function GlassInteractionSurface({
  background,
  children,
  style,
  borderRadius,
  interactive = false,
  onPress,
  enableScale = false,
  blurIntensity = DEFAULT_BLUR_INTENSITY,
  accessibilityLabel,
}: Props) {
  const [active, setActive] = useState(false);
  const scale = useSharedValue(1);

  const setInteractionActive = (next: boolean) => {
    setActive(next);
    if (enableScale) {
      scale.value = withTiming(next ? ACTIVE_SCALE : 1, SCALE_TIMING);
    }
  };

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shell = (
    <Animated.View
      style={[
        styles.shell,
        { borderRadius },
        enableScale && animatedScaleStyle,
        active && styles.shellActive,
        style,
      ]}
    >
      {background ? (
        <View style={[styles.backgroundLayer, { borderRadius }]} pointerEvents="none">
          {background}
        </View>
      ) : null}

      {active ? (
        <View style={[styles.blurLayer, { borderRadius }]} pointerEvents="none">
          <BlurView
            intensity={blurIntensity}
            tint="dark"
            experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[styles.glassOverlay, { borderRadius }]} />
        </View>
      ) : null}

      <View style={styles.contentLayer}>{children}</View>
    </Animated.View>
  );

  return (
    <Pressable
      onPress={interactive ? onPress : undefined}
      onPressIn={() => setInteractionActive(true)}
      onPressOut={() => setInteractionActive(false)}
      onHoverIn={() => setInteractionActive(true)}
      onHoverOut={() => setInteractionActive(false)}
      accessibilityRole={interactive ? "button" : "none"}
      accessibilityLabel={accessibilityLabel}
    >
      {shell}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.2)",
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
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.28)",
  },
  contentLayer: {
    zIndex: 2,
    position: "relative",
  },
});
