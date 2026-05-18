import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  ScheduleDayLabelsRow,
  ScheduleWeekGrid,
  scheduleSlotsToGridBlocks,
} from "@/components/schedule/ScheduleWeekGrid";
import { WEEK_DAY_LABELS } from "@/constants/weekScheduleMock";
import {
  dayIndexToWeekday,
  formatMinutesAsTime,
  newScheduleSlotId,
  parseTimeToMinutes,
} from "@/lib/scheduleTime";
import { useTheme } from "@/hooks";
import type { CreateCourseScheduleSlot, Weekday } from "@/types";

const TR_DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

type Props = {
  slots: CreateCourseScheduleSlot[];
  onChange: (slots: CreateCourseScheduleSlot[]) => void;
  disabled?: boolean;
  /** Inner content width (e.g. modal body) so the week grid scales horizontally. */
  layoutWidth?: number;
};

type SlotForm = {
  weekday: Weekday;
  startInput: string;
  endInput: string;
  location: string;
};

function emptyForm(weekday: Weekday = 1): SlotForm {
  return { weekday, startInput: "09:00", endInput: "10:30", location: "" };
}

export function CourseScheduleEditor({ slots, onChange, disabled, layoutWidth }: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SlotForm>(emptyForm());

  const blocks = useMemo(() => scheduleSlotsToGridBlocks(slots), [slots]);

  const openAdd = useCallback((dayIndex?: number) => {
    const weekday = dayIndex != null ? dayIndexToWeekday(dayIndex) : 1;
    setEditingId(null);
    setForm(emptyForm(weekday));
    setFormVisible(true);
  }, []);

  const openEdit = useCallback(
    (id: string) => {
      const slot = slots.find((s) => s.id === id);
      if (!slot) return;
      setEditingId(id);
      setForm({
        weekday: slot.weekday,
        startInput: formatMinutesAsTime(slot.startMinutes),
        endInput: formatMinutesAsTime(slot.endMinutes),
        location: slot.location ?? "",
      });
      setFormVisible(true);
    },
    [slots],
  );

  const closeForm = useCallback(() => {
    setFormVisible(false);
    setEditingId(null);
  }, []);

  const saveSlot = useCallback(() => {
    const startMinutes = parseTimeToMinutes(form.startInput);
    const endMinutes = parseTimeToMinutes(form.endInput);
    if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) return;

    const nextSlot: CreateCourseScheduleSlot = {
      id: editingId ?? newScheduleSlotId(),
      weekday: form.weekday,
      startMinutes,
      endMinutes,
      ...(form.location.trim() ? { location: form.location.trim() } : {}),
    };

    if (editingId) {
      onChange(slots.map((s) => (s.id === editingId ? nextSlot : s)));
    } else {
      onChange([...slots, nextSlot]);
    }
    closeForm();
  }, [closeForm, editingId, form, onChange, slots]);

  const removeSlot = useCallback(
    (id: string) => {
      onChange(slots.filter((s) => s.id !== id));
      if (editingId === id) closeForm();
    },
    [closeForm, editingId, onChange, slots],
  );

  const formValid = useMemo(() => {
    const start = parseTimeToMinutes(form.startInput);
    const end = parseTimeToMinutes(form.endInput);
    return start != null && end != null && end > start;
  }, [form.endInput, form.startInput]);

  return (
    <View style={{ gap: spacing.sm }}>
      <ScheduleDayLabelsRow layoutWidth={layoutWidth} />
      <ScheduleWeekGrid
        blocks={blocks}
        maxHeight={220}
        editable={!disabled}
        onBlockPress={openEdit}
        onDayPress={(dayIndex) => openAdd(dayIndex)}
        layoutWidth={layoutWidth}
      />

      <Pressable
        onPress={() => openAdd()}
        disabled={disabled}
        style={styles.addBtn}
        accessibilityRole="button"
      >
        <MaterialIcons name="add-circle-outline" size={24} color={colors.highlight} />
        <Text style={[typography.caption, { color: colors.highlight }]}>Slot ekle</Text>
      </Pressable>

      {slots.length > 0 ? (
        <View style={{ gap: spacing.xs }}>
          {slots.map((s) => (
            <View key={s.id} style={[styles.slotRow, { borderColor: colors.border }]}>
              <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]}>
                {TR_DAY_LABELS[s.weekday - 1]} {formatMinutesAsTime(s.startMinutes)}–
                {formatMinutesAsTime(s.endMinutes)}
                {s.location ? ` · ${s.location}` : ""}
              </Text>
              <Pressable
                onPress={() => removeSlot(s.id)}
                disabled={disabled}
                hitSlop={8}
                accessibilityRole="button"
              >
                <MaterialIcons name="close" size={18} color={colors.danger} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {formVisible ? (
        <View
          style={[
            styles.formCard,
            {
              borderColor: colors.border,
              borderRadius: radius.md,
              backgroundColor: colors.background,
              gap: spacing.sm,
              padding: spacing.md,
            },
          ]}
        >
          <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: "600" }]}>
            {editingId ? "Slotu düzenle" : "Yeni slot"}
          </Text>

          <View style={styles.weekdayRow}>
            {WEEK_DAY_LABELS.map((_, idx) => {
              const w = dayIndexToWeekday(idx);
              const selected = form.weekday === w;
              return (
                <Pressable
                  key={idx}
                  disabled={disabled}
                  onPress={() => setForm((f) => ({ ...f, weekday: w }))}
                  style={[
                    styles.weekdayChip,
                    {
                      borderColor: colors.border,
                      borderRadius: radius.sm,
                      backgroundColor: selected ? colors.accent : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: selected ? "#fff" : colors.textSecondary,
                        fontWeight: selected ? "700" : "500",
                        fontSize: 11,
                      },
                    ]}
                  >
                    {TR_DAY_LABELS[idx]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.timeRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>Başlangıç</Text>
              <TextInput
                value={form.startInput}
                onChangeText={(t) => setForm((f) => ({ ...f, startInput: t }))}
                placeholder="09:00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numbers-and-punctuation"
                editable={!disabled}
                style={[styles.timeInput, typography.body, { color: colors.textPrimary, borderColor: colors.border }]}
              />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>Bitiş</Text>
              <TextInput
                value={form.endInput}
                onChangeText={(t) => setForm((f) => ({ ...f, endInput: t }))}
                placeholder="10:30"
                placeholderTextColor={colors.textMuted}
                keyboardType="numbers-and-punctuation"
                editable={!disabled}
                style={[styles.timeInput, typography.body, { color: colors.textPrimary, borderColor: colors.border }]}
              />
            </View>
          </View>

          <TextInput
            value={form.location}
            onChangeText={(t) => setForm((f) => ({ ...f, location: t }))}
            placeholder="Konum (isteğe bağlı)"
            placeholderTextColor={colors.textMuted}
            editable={!disabled}
            style={[styles.timeInput, typography.body, { color: colors.textPrimary, borderColor: colors.border }]}
          />

          {!formValid ? (
            <Text style={[typography.caption, { color: colors.warning }]}>
              Geçerli saat aralığı girin (ör. 09:00 – 10:30).
            </Text>
          ) : null}

          <View style={styles.formActions}>
            <Pressable onPress={closeForm} hitSlop={8}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>İptal</Text>
            </Pressable>
            <Pressable
              onPress={saveSlot}
              disabled={!formValid || disabled}
              style={[styles.saveChip, { opacity: !formValid || disabled ? 0.45 : 1 }]}
            >
              <Text style={[typography.caption, { color: colors.primaryDark, fontWeight: "700" }]}>
                Kaydet
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  formCard: {
    borderWidth: 1,
  },
  weekdayRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  weekdayChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
  },
  saveChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFC85C",
  },
});
