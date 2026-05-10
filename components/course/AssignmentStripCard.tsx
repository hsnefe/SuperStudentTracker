import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Assignment } from "@/types";

const ORANGE = "#FF653F";

type Props = {
  variant: 0 | 1 | 2 | 3;
  indexLabel: string;
  assignment: Assignment;
  onPress: () => void;
  width: number;
  height: number;
};

export function AssignmentStripCard({
  variant,
  indexLabel,
  assignment,
  onPress,
  width,
  height,
}: Props) {
  const inner = (
    <>
      <Text
        style={[
          styles.num,
          variant === 1 ? styles.numLight : variant === 3 ? styles.numLight : styles.numAccent,
        ]}
      >
        {indexLabel}
      </Text>
      <Text style={[styles.cardTitle, variant === 1 && styles.textLight]} numberOfLines={2}>
        {assignment.title}
      </Text>
      <Text
        style={[styles.desc, variant === 1 ? styles.descLight : styles.descMuted]}
        numberOfLines={2}
      >
        {assignment.description}
      </Text>
    </>
  );

  const face =
    variant === 1 ? (
      <LinearGradient
        colors={["rgba(255,101,63,0.45)", "rgba(230,87,21,0.35)", "rgba(184,50,8,0.3)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.face, styles.facePad, { width, height }]}
      >
        {inner}
      </LinearGradient>
    ) : (
      <View
        style={[
          styles.face,
          styles.facePad,
          { width, height },
          variant === 0 && styles.glassA,
          variant === 2 && styles.glassB,
          variant === 3 && styles.glassC,
        ]}
      >
        {inner}
      </View>
    );

  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ width, height }}>
      {face}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.22)",
  },
  facePad: {
    padding: 12,
    justifyContent: "space-between",
  },
  glassA: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  glassB: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  glassC: {
    backgroundColor: "rgba(20,12,40,0.42)",
  },
  num: {
    fontSize: 18,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  numAccent: {
    color: ORANGE,
  },
  numLight: {
    color: "#fff",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
    flex: 1,
    marginVertical: 4,
  },
  textLight: {
    color: "#fff",
  },
  desc: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
  },
  descMuted: {
    color: "rgba(255,255,255,0.72)",
  },
  descLight: {
    color: "rgba(255,255,255,0.88)",
  },
});
