import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks";

type Props = {
  visible: boolean;
  message: string;
  onDismiss: () => void;
};

/** Lightweight bottom toast — no extra dependencies. */
export function SimpleToast({ visible, message, onDismiss }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { bottom: spacing.lg + insets.bottom }]}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: colors.secondaryDark,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          },
        ]}
      >
        <Text style={[typography.caption, { color: colors.textPrimary }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 50,
  },
  box: {
    maxWidth: "92%",
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
