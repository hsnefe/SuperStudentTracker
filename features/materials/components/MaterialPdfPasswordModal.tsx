import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "@/hooks";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (password: string) => void;
};

export function MaterialPdfPasswordModal({ visible, onCancel, onSubmit }: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    onSubmit(value);
    setValue("");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[typography.title, { color: colors.textPrimary, fontSize: 18 }]}>
            PDF password
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            This document is password protected.
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                backgroundColor: colors.primaryDark,
                borderColor: colors.border,
                borderRadius: radius.md,
                color: colors.textPrimary,
                marginTop: spacing.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
              },
            ]}
          />
          <View style={[styles.actions, { marginTop: spacing.lg, gap: spacing.sm }]}>
            <Pressable
              onPress={onCancel}
              style={[styles.btn, { borderColor: colors.border, borderRadius: radius.md }]}
            >
              <Text style={[typography.body, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={[
                styles.btn,
                { backgroundColor: colors.accent, borderRadius: radius.md },
              ]}
            >
              <Text style={[typography.body, { color: "#111", fontWeight: "600" }]}>Open</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 24,
  },
  card: { borderWidth: 1 },
  input: { borderWidth: 1 },
  actions: { flexDirection: "row" },
  btn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderWidth: 1,
  },
});
