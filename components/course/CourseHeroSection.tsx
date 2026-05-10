import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import {
  COURSE_BLUR_BRIDGE_HALF_PX,
  courseHeroMinHeightPx,
} from "@/constants/courseDetailVisual";
import { useTheme } from "@/hooks";

const APP_BAR_BOTTOM_PADDING = 12;
/** Approximate visual height below safe area for one-line bar row (logo / pill / icon). */
export const COURSE_APP_BAR_CONTENT_HEIGHT = 44;

const STAT_CARD_WIDTH = 156;

type StatMock = {
  percentLabel: string;
  caption: string;
};

type Props = {
  line1: string;
  line2: string;
  mockStat: StatMock;
  activeTodos: number;
  assignmentCount: number;
  assignmentsLoading: boolean;
  appBar: ReactNode;
};

export function CourseHeroSection({
  line1,
  line2,
  mockStat,
  activeTodos,
  assignmentCount,
  assignmentsLoading,
  appBar,
}: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { spacing, radius } = useTheme();

  const minHeight = courseHeroMinHeightPx(height);
  const paddingTop =
    insets.top + 8 + COURSE_APP_BAR_CONTENT_HEIGHT + APP_BAR_BOTTOM_PADDING + spacing.sm;

  const todoSummary = assignmentsLoading
    ? ""
    : `${activeTodos} to-do${activeTodos === 1 ? "" : "s"} in ${assignmentCount} assignment${assignmentCount === 1 ? "" : "s"}`;

  return (
    <View style={[styles.root, { minHeight }]}>
      <LinearGradient
        colors={["#FF653F", "#c73d18", "#1a0a06", "#0d0806"]}
        locations={[0, 0.35, 0.72, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Background-only blur; hero content renders above this layer. */}
      <View style={styles.blurBridge} pointerEvents="none">
        <BlurView
          intensity={Platform.OS === "ios" ? 55 : 35}
          tint="dark"
          experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : undefined}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={["transparent", "rgba(10,8,12,0.92)"]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <View style={[styles.heroInner, { paddingTop }]} pointerEvents="box-none">
        <Text style={styles.heroLine1} numberOfLines={2}>
          {line1}
        </Text>

        <View style={styles.flexSpacer} />

        <View style={[styles.bottomBand, { gap: spacing.md }]}>
          <View style={[styles.statsRow, { gap: spacing.sm }]}>
            <View
              style={[
                styles.statCardLight,
                { borderRadius: radius.lg, width: STAT_CARD_WIDTH },
              ]}
            >
              <Text style={styles.statPercentOrange}>{mockStat.percentLabel}</Text>
              <Text style={styles.statCaptionDark}>{mockStat.caption}</Text>
            </View>

            <View
              style={[
                styles.statCardGlass,
                { borderRadius: radius.lg, width: STAT_CARD_WIDTH },
              ]}
            >
              {assignmentsLoading ? (
                <ActivityIndicator color="#fff" style={{ marginVertical: 12 }} />
              ) : (
                <>
                  <Text style={styles.statNumberLight}>{activeTodos}</Text>
                  <Text style={styles.statCaptionLight}>{todoSummary}</Text>
                </>
              )}
            </View>
          </View>

          <Text style={styles.heroLine2} numberOfLines={3}>
            {line2}
          </Text>
        </View>
      </View>

      <View style={styles.appBarSlot} pointerEvents="box-none">
        {appBar}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    overflow: "hidden",
  },
  blurBridge: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: COURSE_BLUR_BRIDGE_HALF_PX,
  },
  heroInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  appBarSlot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 4,
  },
  heroLine1: {
    alignSelf: "flex-start",
    maxWidth: "85%",
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 2,
  },
  heroLine2: {
    flex: 1,
    minWidth: 0,
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 2,
    textAlign: "right",
  },
  flexSpacer: {
    flexGrow: 1,
    minHeight: 24,
  },
  bottomBand: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    width: "100%",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    flexShrink: 0,
  },
  statCardLight: {
    backgroundColor: "#fff",
    padding: 14,
    minHeight: 120,
    justifyContent: "space-between",
  },
  statPercentOrange: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FF653F",
    fontVariant: ["tabular-nums"],
  },
  statCaptionDark: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3a3a42",
    lineHeight: 15,
    marginTop: 8,
  },
  statCardGlass: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.2)",
    padding: 14,
    minHeight: 120,
    justifyContent: "space-between",
  },
  statNumberLight: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    fontVariant: ["tabular-nums"],
  },
  statCaptionLight: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.82)",
    lineHeight: 15,
    marginTop: 8,
  },
});
