import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { useTheme } from "../../core/theme/useTheme";

export function ScreenContainer({ children }: PropsWithChildren) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
});
