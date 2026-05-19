import { useCallback, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type View as RNView,
} from "react-native";
import type { TransitionOriginRect } from "@/store/navigationTransitionStore";
import { useTheme } from "@/hooks";

const CARD_WIDTH = 156;

type Props = {
  percentLabel: string;
  caption: string;
  canAddToday: boolean;
  onCardPress: (origin: TransitionOriginRect) => void;
  onAddPress: () => void;
};

export function AttendanceStatCard({
  percentLabel,
  caption,
  canAddToday,
  onCardPress,
  onAddPress,
}: Props) {
  const { radius } = useTheme();
  const cardRef = useRef<RNView>(null);
  const [hovered, setHovered] = useState(false);

  const showAddButton = Platform.OS === "web" ? hovered : true;

  const handleCardPress = useCallback(() => {
    const node = cardRef.current;
    if (!node) {
      onCardPress({ x: 0, y: 0, width: CARD_WIDTH, height: 120 });
      return;
    }
    node.measureInWindow((x, y, width, height) => {
      onCardPress({
        x,
        y,
        width: width > 0 ? width : CARD_WIDTH,
        height: height > 0 ? height : 120,
      });
    });
  }, [onCardPress]);

  const handleAddPress = useCallback(() => {
    if (!canAddToday) return;
    onAddPress();
  }, [canAddToday, onAddPress]);

  return (
    <View ref={cardRef} style={[styles.wrap, { width: CARD_WIDTH, borderRadius: radius.lg }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Attendance summary"
        style={({ pressed }) => [
          styles.card,
          { borderRadius: radius.lg },
          pressed && styles.cardPressed,
        ]}
        onPress={handleCardPress}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
      >
        <Text style={styles.percent}>{percentLabel}</Text>
        <Text style={styles.caption}>{caption}</Text>
      </Pressable>

      {showAddButton ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mark absence for today"
          style={({ pressed }) => [
            styles.fab,
            !canAddToday && styles.fabDisabled,
            pressed && canAddToday && styles.fabPressed,
          ]}
          onPress={handleAddPress}
          disabled={!canAddToday}
          hitSlop={8}
        >
          <Text style={styles.fabLabel}>+</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    minHeight: 120,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
    minHeight: 120,
    justifyContent: "space-between",
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.98 }],
  },
  percent: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FF653F",
    fontVariant: ["tabular-nums"],
  },
  caption: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3a3a42",
    lineHeight: 15,
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF653F",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  fabDisabled: {
    opacity: 0.35,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.92 }],
  },
  fabLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: -1,
  },
});
