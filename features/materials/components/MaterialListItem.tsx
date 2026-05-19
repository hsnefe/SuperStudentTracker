import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as WebBrowser from "expo-web-browser";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks";
import type { CourseMaterial } from "@/types";
import { formatMaterialDate, formatMaterialSize } from "../lib/materialFormat";
import { materialKindIcon } from "../lib/materialIcons";
import { MATERIAL_FOLDER_LABELS } from "../lib/materialOptions";

type Props = {
  material: CourseMaterial;
  onLongPress?: () => void;
  compact?: boolean;
};

export function MaterialListItem({ material, onLongPress, compact }: Props) {
  const { colors, typography, spacing, radius } = useTheme();
  const subtitle = material.fileName ?? formatMaterialDate(material.createdAt);
  const sizeLabel = formatMaterialSize(material.sizeBytes);

  const openMaterial = async () => {
    try {
      if (material.kind === "link") {
        const can = await Linking.canOpenURL(material.uri);
        if (can) await Linking.openURL(material.uri);
        else Alert.alert("Cannot open link", material.uri);
        return;
      }
      await WebBrowser.openBrowserAsync(material.uri);
    } catch {
      Alert.alert("Could not open", "This file could not be opened on this device.");
    }
  };

  return (
    <Pressable
      onPress={() => void openMaterial()}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: pressed ? "rgba(255,255,255,0.06)" : colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: compact ? spacing.sm : spacing.md,
          marginBottom: spacing.sm,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${material.title}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: "rgba(255,200,92,0.12)" }]}>
        <MaterialIcons name={materialKindIcon(material.kind)} size={22} color="#FFC85C" />
      </View>
      <View style={styles.body}>
        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]} numberOfLines={1}>
          {material.title}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
          {subtitle}
        </Text>
        {!compact ? (
          <View style={styles.metaRow}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {MATERIAL_FOLDER_LABELS[material.kind]}
            </Text>
            {sizeLabel ? (
              <Text style={[typography.caption, { color: colors.textMuted }]}>{sizeLabel}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
      <MaterialIcons name="chevron-right" size={22} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
});
