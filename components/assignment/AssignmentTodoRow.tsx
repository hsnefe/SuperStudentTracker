import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeOut,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { TodoItem } from "@/types";

const ANIM_MS = 350;

type Props = {
  todo: TodoItem;
  labelColor: string;
  /** When set, animates completion then calls with todo id (mark done). */
  onComplete?: (todoId: string) => void;
  /** When set, toggles done state without exit animation (detail list). */
  onToggle?: (todoId: string, done: boolean) => void;
};

export function AssignmentTodoRow({ todo, labelColor, onComplete, onToggle }: Props) {
  const isDone = todo.done;
  const [checked, setChecked] = useState(isDone);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (onToggle) {
      setChecked(todo.done);
    }
  }, [onToggle, todo.done, todo.id]);
  const opacity = useSharedValue(1);
  const rowHeight = useSharedValue(1);

  const finishExit = useCallback(() => {
    onComplete?.(todo.id);
  }, [onComplete, todo.id]);

  const handlePress = useCallback(() => {
    if (onToggle) {
      onToggle(todo.id, !isDone);
      return;
    }
    if (onComplete) {
      if (checked || exiting || isDone) return;
      setChecked(true);
      setExiting(true);
      opacity.value = withTiming(0, { duration: ANIM_MS });
      rowHeight.value = withTiming(0, { duration: ANIM_MS }, (finished) => {
        if (finished) {
          runOnJS(finishExit)();
        }
      });
      return;
    }
  }, [
    checked,
    exiting,
    finishExit,
    isDone,
    onComplete,
    onToggle,
    opacity,
    rowHeight,
    todo.id,
  ]);

  const animatedRowStyle = useAnimatedStyle(() => ({
    opacity: onComplete && exiting ? opacity.value : 1,
    maxHeight: onComplete && exiting && rowHeight.value === 0 ? 0 : 48,
    marginBottom: onComplete && exiting && rowHeight.value === 0 ? 0 : 6,
    overflow: "hidden" as const,
  }));

  const showChecked = onToggle ? isDone : checked || isDone;

  return (
    <Animated.View
      layout={LinearTransition.duration(ANIM_MS)}
      exiting={onComplete ? FadeOut.duration(ANIM_MS) : undefined}
      style={animatedRowStyle}
    >
      <Pressable
        onPress={handlePress}
        disabled={onComplete ? checked || exiting || isDone : false}
        style={styles.row}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: showChecked }}
        accessibilityLabel={todo.name}
        hitSlop={4}
      >
        <View style={[styles.box, showChecked && styles.boxChecked]}>
          {showChecked ? (
            <MaterialIcons name="check" size={12} color="#fff" />
          ) : null}
        </View>
        <Text
          style={[
            styles.label,
            { color: labelColor },
            showChecked && styles.labelDone,
          ]}
          numberOfLines={2}
        >
          {todo.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  box: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  boxChecked: {
    backgroundColor: "rgba(255,200,92,0.9)",
    borderColor: "rgba(255,200,92,0.9)",
  },
  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  labelDone: {
    opacity: 0.55,
    textDecorationLine: "line-through",
  },
});
