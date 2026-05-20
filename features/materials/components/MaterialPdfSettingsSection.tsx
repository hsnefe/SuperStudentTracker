import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks";
import { useMaterialViewerStore } from "@/store/materialViewerStore";

export function MaterialPdfSettingsSection() {
  const { colors, spacing, typography, radius } = useTheme();
  const { mode, hydrated, hydrate, setMode } = useMaterialViewerStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) return null;

  const inApp = mode === "in_app";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
        },
      ]}
    >
      <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>
        PDF viewer
      </Text>
      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
        Choose how PDF materials open when tapped.
      </Text>
      <View style={[styles.row, { marginTop: spacing.md, gap: spacing.sm }]}>
        <Pressable
          onPress={() => setMode("in_app")}
          style={[
            styles.option,
            {
              borderColor: inApp ? colors.accent : colors.border,
              backgroundColor: inApp ? "rgba(255,200,92,0.12)" : colors.primaryDark,
              borderRadius: radius.md,
            },
          ]}
        >
          <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: "600" }]}>
            In-app viewer
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("browser")}
          style={[
            styles.option,
            {
              borderColor: !inApp ? colors.accent : colors.border,
              backgroundColor: !inApp ? "rgba(255,200,92,0.12)" : colors.primaryDark,
              borderRadius: radius.md,
            },
          ]}
        >
          <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: "600" }]}>
            In-app browser
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  row: { flexDirection: "row" },
  option: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
});
