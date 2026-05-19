import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

export type AssignmentStripCardVariant = 0 | 1 | 2 | 3;

export const STRIP_CARD_RADIUS = 16;

export function parseCardVariant(raw: string | string[] | undefined): AssignmentStripCardVariant {
  const s = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  const n = Number(s);
  if (n === 1 || n === 2 || n === 3) return n;
  return 0;
}

type Props = {
  variant: AssignmentStripCardVariant;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
};

export function AssignmentStripCardBackground({
  variant,
  style,
  borderRadius = STRIP_CARD_RADIUS,
}: Props) {
  const fillStyle = [{ borderRadius }, style];

  if (variant === 1) {
    return (
      <LinearGradient
        colors={["rgba(255,101,63,0.45)", "rgba(230,87,21,0.35)", "rgba(184,50,8,0.3)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={fillStyle}
      />
    );
  }

  return (
    <View
      style={[
        fillStyle,
        variant === 0 && styles.glassA,
        variant === 2 && styles.glassB,
        variant === 3 && styles.glassC,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  glassA: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  glassB: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  glassC: {
    backgroundColor: "rgba(20,12,40,0.42)",
  },
});
