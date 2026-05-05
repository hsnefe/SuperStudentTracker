import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { CourseGridItem } from "@/constants/coursesMock";
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

export function getCourseCardTotalHeight(cardWidth: number, spacingSm: number): number {
  const imageHeight = Math.round(cardWidth * COURSE_CARD_IMAGE_RATIO);
  const border = StyleSheet.hairlineWidth * 2;
  return imageHeight + getCourseCardFooterOuterHeight(spacingSm) + border;
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
  const cardOuterHeight = imageHeight + footerOuterHeight + StyleSheet.hairlineWidth * 2;
  const footerPadding = spacing.sm;
  const showRemote = Boolean(course.imageUrl) && !imgFailed;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Course ${course.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        {
          width,
          height: cardOuterHeight,
          opacity: pressed ? 0.92 : 1,
          transform: pressed ? [{ scale: 0.985 }] : [{ scale: 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            height: cardOuterHeight,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.lg,
          },
        ]}
      >
        <View
          style={[
            styles.thumbWrap,
            {
              height: imageHeight,
              borderTopLeftRadius: radius.lg,
              borderTopRightRadius: radius.lg,
            },
          ]}
        >
          <Image
            source={showRemote ? { uri: course.imageUrl! } : PLACEHOLDER}
            style={[styles.thumb, { height: imageHeight }]}
            resizeMode="cover"
            onError={() => setImgFailed(true)}
          />
        </View>

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
    </Pressable>
  );
}

const paletteWhite = "#ffffff";

const styles = StyleSheet.create({
  pressable: {},
  card: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "column",
  },
  thumbWrap: {
    overflow: "hidden",
    width: "100%",
    flexShrink: 0,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  thumb: {
    width: "100%",
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
