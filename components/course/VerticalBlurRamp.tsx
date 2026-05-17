import MaskedView from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import {
  COURSE_BLUR_BRIDGE_HALF_PX,
  COURSE_BLUR_MAX_INTENSITY_ANDROID,
  COURSE_BLUR_MAX_INTENSITY_IOS,
  COURSE_BLUR_SLICE_COUNT_WEB,
} from "@/constants/courseDetailVisual";

export type BlurRampDirection = "increase" | "decrease";

type Props = {
  direction: BlurRampDirection;
  /** Band height when not filling parent. */
  height?: number;
  /** Fill parent container (assignments section background). */
  fillParent?: boolean;
  maxIntensity?: number;
  overlayGradient?: readonly [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
};

function defaultMaxIntensity(): number {
  return Platform.OS === "ios" ? COURSE_BLUR_MAX_INTENSITY_IOS : COURSE_BLUR_MAX_INTENSITY_ANDROID;
}

function maskGradientColors(direction: BlurRampDirection): [string, string, ...string[]] {
  if (direction === "increase") {
    return ["rgba(0,0,0,0)", "rgba(0,0,0,0.4)", "rgba(0,0,0,1)"];
  }
  return ["rgba(0,0,0,1)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0)"];
}

function defaultOverlayGradient(direction: BlurRampDirection): [string, string, ...string[]] {
  if (direction === "increase") {
    return ["transparent", "rgba(10,8,12,0.45)", "rgba(10,8,12,0.92)"];
  }
  return ["rgba(10,8,12,0.92)", "rgba(10,8,12,0.35)", "transparent"];
}

function sliceWeight(direction: BlurRampDirection, index: number, count: number): number {
  const t = count <= 1 ? 1 : index / (count - 1);
  if (direction === "increase") return t;
  return 1 - t;
}

type SliceProps = {
  direction: BlurRampDirection;
  bandHeight: number;
  fillParent: boolean;
  maxIntensity: number;
};

function GraduatedBlurSlices({ direction, bandHeight, fillParent, maxIntensity }: SliceProps) {
  const count = COURSE_BLUR_SLICE_COUNT_WEB;
  const overlap = 1;

  return (
    <View style={fillParent ? StyleSheet.absoluteFillObject : { height: bandHeight }} pointerEvents="none">
      {Array.from({ length: count }, (_, i) => {
        const w = sliceWeight(direction, i, count);
        const opacity = 0.12 + w * 0.88;

        if (fillParent) {
          const topPct = (i / count) * 100;
          const heightPct = 100 / count + 2;
          return (
            <View
              key={i}
              style={[
                styles.slice,
                { top: `${topPct}%`, height: `${heightPct}%`, opacity },
              ]}
            >
              <BlurView intensity={maxIntensity} tint="dark" style={StyleSheet.absoluteFillObject} />
            </View>
          );
        }

        const sliceH = Math.ceil(bandHeight / count) + overlap;
        const top = i * (sliceH - overlap);
        return (
          <View key={i} style={[styles.slice, { top, height: sliceH, opacity }]}>
            <BlurView intensity={maxIntensity} tint="dark" style={StyleSheet.absoluteFillObject} />
          </View>
        );
      })}
    </View>
  );
}

type MaskedBlurProps = {
  direction: BlurRampDirection;
  maxIntensity: number;
};

function MaskedGraduatedBlur({ direction, maxIntensity }: MaskedBlurProps) {
  const colors = maskGradientColors(direction);

  return (
    <MaskedView
      style={StyleSheet.absoluteFillObject}
      maskElement={
        <LinearGradient colors={colors} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFillObject} />
      }
    >
      <BlurView
        intensity={maxIntensity}
        tint="dark"
        experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
        style={StyleSheet.absoluteFillObject}
      />
    </MaskedView>
  );
}

export function VerticalBlurRamp({
  direction,
  height = COURSE_BLUR_BRIDGE_HALF_PX,
  fillParent = false,
  maxIntensity = defaultMaxIntensity(),
  overlayGradient,
  style,
}: Props) {
  const overlay = overlayGradient ?? defaultOverlayGradient(direction);
  const containerStyle: StyleProp<ViewStyle> = fillParent
    ? [StyleSheet.absoluteFillObject, style]
    : [{ height }, style];

  const overlayLocations =
    overlay.length === 2 ? ([0, 1] as const) : ([0, 0.5, 1] as const);

  return (
    <View style={containerStyle} pointerEvents="none">
      {Platform.OS === "web" ? (
        <GraduatedBlurSlices
          direction={direction}
          bandHeight={height}
          fillParent={fillParent}
          maxIntensity={maxIntensity}
        />
      ) : (
        <MaskedGraduatedBlur direction={direction} maxIntensity={maxIntensity} />
      )}
      <LinearGradient
        colors={[...overlay]}
        locations={overlayLocations}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slice: {
    position: "absolute",
    left: 0,
    right: 0,
    overflow: "hidden",
  },
});
