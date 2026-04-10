import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../core/theme/useTheme";

type PlaceholderCardProps = {
  title: string;
  description: string;
  rightSlot?: ReactNode;
};

export function PlaceholderCard({
  title,
  description,
  rightSlot,
}: PlaceholderCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.textContent}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      {rightSlot}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  textContent: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  description: { fontSize: 14, lineHeight: 20 },
});
