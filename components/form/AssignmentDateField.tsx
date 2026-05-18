import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTheme } from "@/hooks";

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplay(iso: string): string {
  const d = parseIsoDate(iso);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Props = {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  disabled?: boolean;
};

export function AssignmentDateField({ label, value, onChange, disabled }: Props) {
  const { colors, typography, radius, spacing } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const onDateChange = useCallback(
    (_event: unknown, date?: Date) => {
      if (Platform.OS === "android") setShowPicker(false);
      if (date) onChange(toIsoDate(date));
    },
    [onChange],
  );

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.caption, styles.label, { color: colors.textSecondary }]}>{label}</Text>

      {Platform.OS === "web" ? (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
          editable={!disabled}
          style={[
            styles.trigger,
            typography.body,
            { color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.md },
          ]}
        />
      ) : (
        <>
          <Pressable
            onPress={() => !disabled && setShowPicker(true)}
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
          >
            <Text style={[typography.body, { color: colors.textPrimary }]}>{formatDisplay(value)}</Text>
          </Pressable>
          {showPicker ? (
            <DateTimePicker
              value={parseIsoDate(value)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
            />
          ) : null}
          {Platform.OS === "ios" && showPicker ? (
            <Pressable onPress={() => setShowPicker(false)} hitSlop={8}>
              <Text style={[typography.caption, { color: colors.highlight }]}>Done</Text>
            </Pressable>
          ) : null}
        </>
      )}
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
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
