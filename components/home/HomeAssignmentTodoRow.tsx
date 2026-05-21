import { useCallback, useState } from "react";
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
import type { Task } from "@/types";

const ANIM_MS = 350;

type Props = {
  task: Task;
  labelColor: string;
  onComplete: (taskId: string) => void;
};

export function HomeAssignmentTodoRow({ task, labelColor, onComplete }: Props) {
  const [checked, setChecked] = useState(false);
  const [exiting, setExiting] = useState(false);
  const opacity = useSharedValue(1);
  const rowHeight = useSharedValue(1);

  const finishExit = useCallback(() => {
    onComplete(task.id);
  }, [onComplete, task.id]);

  const handlePress = useCallback(() => {
    if (checked || exiting) return;
    setChecked(true);
    setExiting(true);
    opacity.value = withTiming(0, { duration: ANIM_MS });
    rowHeight.value = withTiming(0, { duration: ANIM_MS }, (finished) => {
      if (finished) {
        runOnJS(finishExit)();
      }
    });
  }, [checked, exiting, finishExit, opacity, rowHeight]);

  const animatedRowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    maxHeight: rowHeight.value === 0 ? 0 : 48,
    marginBottom: rowHeight.value === 0 ? 0 : 6,
    overflow: "hidden" as const,
  }));

  return (
    <Animated.View
      layout={LinearTransition.duration(ANIM_MS)}
      exiting={FadeOut.duration(ANIM_MS)}
      style={animatedRowStyle}
    >
      <Pressable
        onPress={handlePress}
        disabled={checked || exiting}
        style={styles.row}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={task.title}
        hitSlop={4}
      >
        <View style={[styles.box, checked && styles.boxChecked]}>
          {checked ? (
            <MaterialIcons name="check" size={12} color="#fff" />
          ) : null}
        </View>
        <Text style={[styles.label, { color: labelColor }]} numberOfLines={2}>
          {task.title}
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
});
