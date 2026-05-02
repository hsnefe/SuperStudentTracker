import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks";

type Props = {
  children: ReactNode;
  scroll?: boolean;
};

export function ScreenContainer({ children, scroll = true }: Props) {
  const { colors, spacing } = useTheme();

  const inner = (
    <View
      style={[
        styles.inner,
        { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.md },
      ]}
    >
      {children}
    </View>
  );

  if (!scroll) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>{inner}</View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      {inner}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
