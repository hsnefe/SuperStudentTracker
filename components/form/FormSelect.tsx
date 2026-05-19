import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { SelectOption } from "@/constants/assignmentOptions";
import { useTheme } from "@/hooks";

type Props<T extends string = string> = {
  label: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  hideLabel?: boolean;
};

export function FormSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
  hideLabel,
}: Props<T>) {
  const { colors, typography, radius, spacing } = useTheme();
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: spacing.xs }}>
      {hideLabel ? null : (
        <Text style={[typography.caption, styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        style={[
          styles.trigger,
          {
            borderColor: colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.background,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
          {selected?.label ?? "Select…"}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={22} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[typography.heading, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
              {label}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={{ maxHeight: 320 }}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={[
                      styles.option,
                      {
                        backgroundColor: isSelected ? "rgba(255,101,63,0.15)" : "transparent",
                        borderRadius: radius.sm,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typography.body,
                        {
                          color: colors.textPrimary,
                          fontWeight: isSelected ? "700" : "400",
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});
