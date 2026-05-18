import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SimpleToast } from "@/components/SimpleToast";
import { useTheme } from "@/hooks";
import { AuthForm, type AuthMode } from "../components/AuthForm";

export function AuthScreen() {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>("login");
  const [toast, setToast] = useState<string | null>(null);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingTop: spacing.xl }]}>
        <Text style={[typography.title, { color: colors.textPrimary }]}>SuperStudentTracker</Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          Your courses, schedule, and assignments in one place.
        </Text>
      </View>

      <AuthForm mode={mode} onModeChange={setMode} onToast={setToast} />

      <SimpleToast
        visible={toast != null}
        message={toast ?? ""}
        onDismiss={() => setToast(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {},
});
