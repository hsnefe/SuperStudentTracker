import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VerticalBlurRamp } from "@/components/course/VerticalBlurRamp";
import { courseBlurMaxIntensity } from "@/constants/courseDetailVisual";
import {
  HOME_BLUR_BORDER_RADIUS,
  HOME_BLUR_OVERLAY_GRADIENT,
  HOME_SECTION_TITLE_COLOR,
} from "@/constants/homeBlurVisual";
import { useTheme } from "@/hooks";

export const SCHEDULE_SEGMENTS = ["Upcoming", "Week", "Month", "Year"] as const;
export type ScheduleSegment = (typeof SCHEDULE_SEGMENTS)[number];

type Props = {
  selectedSegment: ScheduleSegment;
  onSelectSegment: (s: ScheduleSegment) => void;
  expanded?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function HomeScheduleBlurSection({
  selectedSegment,
  onSelectSegment,
  expanded = false,
  children,
  style,
}: Props) {
  const { typography, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const maxIntensity = courseBlurMaxIntensity();

  return (
    <View
      style={[
        styles.outer,
        expanded && styles.outerExpanded,
        { borderRadius: expanded ? 0 : HOME_BLUR_BORDER_RADIUS },
        style,
      ]}
    >
      <VerticalBlurRamp
        fillParent
        direction="decrease"
        maxIntensity={maxIntensity}
        overlayGradient={[...HOME_BLUR_OVERLAY_GRADIENT]}
        style={styles.bgLayer}
      />

      <View
        style={[
          styles.foreground,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
            paddingTop: expanded ? spacing.lg + insets.top : spacing.lg,
            gap: spacing.sm,
          },
        ]}
      >
        <Text
          style={[typography.title, styles.title]}
          accessibilityRole="header"
        >
          SCHEDULE
        </Text>

        <View style={[styles.toolbarRow, { marginBottom: spacing.xs }]}>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {}}
            style={({ pressed }) => [
              styles.filterChip,
              { opacity: pressed ? 0.75 : 1, borderRadius: radius.sm },
            ]}
          >
            <Ionicons name="filter-outline" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={[typography.caption, styles.filterLabel]}>Filter</Text>
          </Pressable>

          <View style={[styles.segmentWrap, { borderRadius: radius.sm }]}>
            {SCHEDULE_SEGMENTS.map((seg) => {
              const selected = seg === selectedSegment;
              return (
                <Pressable
                  key={seg}
                  accessibilityRole="button"
                  onPress={() => onSelectSegment(seg)}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: selected ? "rgba(255,200,92,0.22)" : "transparent",
                      borderRadius: radius.sm - 2,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: selected ? "#fff" : "rgba(255,255,255,0.55)",
                        fontWeight: selected ? "600" : "500",
                      },
                    ]}
                  >
                    {seg}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: "relative",
    overflow: "hidden",
    minHeight: 200,
  },
  outerExpanded: {
    flex: 1,
    minHeight: 0,
  },
  bgLayer: {
    zIndex: 0,
  },
  foreground: {
    position: "relative",
    zIndex: 2,
    flex: 1,
  },
  title: {
    color: HOME_SECTION_TITLE_COLOR,
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  toolbarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.2)",
  },
  filterLabel: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },
  segmentWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
    gap: 2,
    maxWidth: "68%",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 2,
  },
  segment: {},
});
