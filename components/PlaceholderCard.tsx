import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks";

type Props = {
  title: string;
  description?: string;
  hint?: string;
};

export function PlaceholderCard({ title, description, hint }: Props) {
  const { colors, radius, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.lg,
          gap: spacing.sm,
        },
      ]}
    >
      <Text style={[typography.heading, { color: colors.textPrimary }]}>{title}</Text>
      {description ? (
        <Text style={[typography.body, { color: colors.textSecondary }]}>{description}</Text>
      ) : null}
      {hint ? (
        <Text style={[typography.caption, { color: colors.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
});
