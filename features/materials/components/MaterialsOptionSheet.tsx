import { FlatList, Modal, Pressable, StyleSheet, Text } from "react-native";
import type { SelectOption } from "@/constants/assignmentOptions";
import { useTheme } from "@/hooks";

type Props<T extends string> = {
  visible: boolean;
  title: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  onClose: () => void;
};

export function MaterialsOptionSheet<T extends string>({
  visible,
  title,
  value,
  options,
  onChange,
  onClose,
}: Props<T>) {
  const { colors, typography, radius, spacing } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
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
            {title}
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
                    onClose();
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
  );
}

const styles = StyleSheet.create({
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
