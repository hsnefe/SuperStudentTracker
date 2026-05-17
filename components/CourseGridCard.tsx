import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { GlassInteractionSurface } from "@/components/course/GlassInteractionSurface";
import type { CourseGridItem } from "@/constants/coursesMock";
import {
  COURSE_GRID_HOVER_SCALE,
  COURSE_GRID_PRESS_SCALE,
  GLASS_BORDER_GLOW_WIDTH,
} from "@/constants/glassInteractionVisual";
import { useTheme } from "@/hooks";

const PLACEHOLDER = require("@/assets/images/partial-react-logo.png");

const BADGE_SIZE = 26;

/** Shared layout so grid clip height matches every card pixel-perfect. */
export const COURSE_CARD_IMAGE_RATIO = 9 / 16;
export const COURSE_CARD_TITLE_LINE_HEIGHT = 17;
export const COURSE_CARD_TITLE_MAX_LINES = 2;
export const COURSE_CARD_TITLE_BADGE_GAP = 8;

export function getCourseCardFooterOuterHeight(spacingSm: number): number {
  return (
    spacingSm +
    COURSE_CARD_TITLE_LINE_HEIGHT * COURSE_CARD_TITLE_MAX_LINES +
    COURSE_CARD_TITLE_BADGE_GAP +
    BADGE_SIZE +
    spacingSm
  );
}

export function getCourseCardInnerHeight(cardWidth: number, spacingSm: number): number {
  const imageHeight = Math.round(cardWidth * COURSE_CARD_IMAGE_RATIO);
  const border = StyleSheet.hairlineWidth * 2;
  return imageHeight + getCourseCardFooterOuterHeight(spacingSm) + border;
}

/** Total card footprint including glass border ring padding. */
export function getCourseCardTotalHeight(cardWidth: number, spacingSm: number): number {
  return getCourseCardInnerHeight(cardWidth, spacingSm) + GLASS_BORDER_GLOW_WIDTH * 2;
}

type Props = {
  course: CourseGridItem;
  width: number;
  onPress: () => void;
};

/** Card inspired by learning-platform tiles; no promotional badges. */
export function CourseGridCard({ course, width, onPress }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const [imgFailed, setImgFailed] = useState(false);

  const imageHeight = Math.round(width * COURSE_CARD_IMAGE_RATIO);
  const footerOuterHeight = getCourseCardFooterOuterHeight(spacing.sm);
  const cardInnerHeight = getCourseCardInnerHeight(width, spacing.sm);
  const footerPadding = spacing.sm;
  const showRemote = Boolean(course.imageUrl) && !imgFailed;

  const cardBackground = (
    <View style={[styles.cardBackground, { height: cardInnerHeight }]}>
      <Image
        source={showRemote ? { uri: course.imageUrl! } : PLACEHOLDER}
        style={[styles.thumb, { height: imageHeight }]}
        resizeMode="cover"
        onError={() => setImgFailed(true)}
      />
      <View style={[styles.surfaceFill, { backgroundColor: colors.surface }]} />
    </View>
  );

  return (
    <GlassInteractionSurface
      interactive
      enableScale
      scaleMode="hoverGrowPressShrink"
      hoverScale={COURSE_GRID_HOVER_SCALE}
      pressScale={COURSE_GRID_PRESS_SCALE}
      enableRotatingBorder
      enableShine
      enableBlur={false}
      borderRadius={radius.lg}
      style={{ width, height: cardInnerHeight }}
      background={cardBackground}
      onPress={onPress}
      accessibilityLabel={`Course ${course.title}`}
    >
      <View style={[styles.cardBody, { height: cardInnerHeight }]}>
        <View style={{ height: imageHeight }} />

        <View
          style={[
            styles.footer,
            {
              height: footerOuterHeight,
              paddingHorizontal: footerPadding,
              paddingVertical: footerPadding,
            },
          ]}
        >
          <View
            style={{
              height: COURSE_CARD_TITLE_LINE_HEIGHT * COURSE_CARD_TITLE_MAX_LINES,
            }}
          >
            <Text
              style={[
                typography.caption,
                styles.title,
                {
                  color: colors.textPrimary,
                  lineHeight: COURSE_CARD_TITLE_LINE_HEIGHT,
                },
              ]}
              numberOfLines={COURSE_CARD_TITLE_MAX_LINES}
            >
              {course.title}
            </Text>
          </View>

          <View style={{ height: COURSE_CARD_TITLE_BADGE_GAP }} />

          <View style={styles.footerRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.accent,
                  width: BADGE_SIZE,
                  height: BADGE_SIZE,
                  borderRadius: BADGE_SIZE / 2,
                },
              ]}
            >
              <Text
                style={[styles.badgeText, { color: paletteWhite }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.65}
              >
                {course.assignmentCount}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </GlassInteractionSurface>
  );
}

const paletteWhite = "#ffffff";

const styles = StyleSheet.create({
  cardBackground: {
    width: "100%",
  },
  cardBody: {
    flexDirection: "column",
  },
  surfaceFill: {
    flex: 1,
    width: "100%",
  },
  thumb: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  footer: {
    flexShrink: 0,
    justifyContent: "flex-start",
  },
  title: {
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
