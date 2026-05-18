import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { AssignmentDateField } from "@/components/form/AssignmentDateField";
import { FormSelect } from "@/components/form/FormSelect";
import {
  ASSIGNMENT_PRIORITY_OPTIONS,
  ASSIGNMENT_STATUS_OPTIONS,
  ASSIGNMENT_TYPE_OPTIONS,
  DEFAULT_ASSIGNMENT_PRIORITY,
  DEFAULT_ASSIGNMENT_STATUS,
  DEFAULT_ASSIGNMENT_TYPE,
  NO_COURSE_OPTION,
  type SelectOption,
} from "@/constants/assignmentOptions";
import { MOCK_COURSES_FALLBACK } from "@/constants/coursesMock";
import { useCoursesGridData } from "@/features/courses/hooks/useCoursesGridData";
import { useTheme } from "@/hooks";
import type { CreateAssignmentInput } from "@/types";

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Props = {
  visible: boolean;
  busy: boolean;
  defaultCourseId: string;
  onClose: () => void;
  onSubmit: (input: CreateAssignmentInput) => void;
};

const MODAL_BASE_MAX_WIDTH = 520;
const MODAL_MAX_WIDTH = MODAL_BASE_MAX_WIDTH * 3;

export function CreateAssignmentModal({
  visible,
  busy,
  defaultCourseId,
  onClose,
  onSubmit,
}: Props) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { colors, spacing, typography, radius } = useTheme();
  const coursesQuery = useCoursesGridData();

  const modalWidth = Math.min(screenW - 32, MODAL_MAX_WIDTH);
  const modalMaxHeight = Math.min(screenH * 0.88, 720);

  const [title, setTitle] = useState("");
  const [type, setType] = useState(DEFAULT_ASSIGNMENT_TYPE);
  const [courseId, setCourseId] = useState(defaultCourseId);
  const [deadline, setDeadline] = useState(() => todayIsoDate());
  const [priority, setPriority] = useState(DEFAULT_ASSIGNMENT_PRIORITY);
  const [status, setStatus] = useState(DEFAULT_ASSIGNMENT_STATUS);

  const resetForm = useCallback(() => {
    setTitle("");
    setType(DEFAULT_ASSIGNMENT_TYPE);
    setCourseId(defaultCourseId);
    setDeadline(todayIsoDate());
    setPriority(DEFAULT_ASSIGNMENT_PRIORITY);
    setStatus(DEFAULT_ASSIGNMENT_STATUS);
  }, [defaultCourseId]);

  useEffect(() => {
    if (visible) {
      setCourseId(defaultCourseId);
    } else {
      resetForm();
    }
  }, [visible, defaultCourseId, resetForm]);

  const courseOptions = useMemo((): SelectOption[] => {
    const base = coursesQuery.isSuccess
      ? (coursesQuery.data ?? [])
      : coursesQuery.isError
        ? MOCK_COURSES_FALLBACK
        : [];
    const fromGrid = base.map((c) => ({ value: c.id, label: c.title }));
    const hasDefault = fromGrid.some((o) => o.value === defaultCourseId);
    const merged = hasDefault
      ? fromGrid
      : defaultCourseId
        ? [{ value: defaultCourseId, label: "Current course" }, ...fromGrid]
        : fromGrid;
    return [NO_COURSE_OPTION, ...merged];
  }, [coursesQuery.data, coursesQuery.isError, coursesQuery.isSuccess, defaultCourseId]);

  const titleValid = title.trim().length > 0;
  const canSubmit = titleValid && !busy;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      type,
      courseId,
      deadline,
      priority,
      status,
    });
  }, [canSubmit, courseId, deadline, onSubmit, priority, status, title, type]);

  const inputStyle = [
    styles.input,
    typography.body,
    { color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.md },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.lg,
              maxHeight: modalMaxHeight,
              width: modalWidth,
              maxWidth: modalWidth,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[typography.title, { color: colors.textPrimary }]}>New assignment</Text>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.flex}
          >
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.sm }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.caption, styles.label, { color: colors.textSecondary }]}>
                  Assignment name
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Final essay"
                  placeholderTextColor={colors.textMuted}
                  editable={!busy}
                  style={inputStyle}
                />
              </View>

              <FormSelect
                label="Assignment type"
                value={type}
                options={ASSIGNMENT_TYPE_OPTIONS}
                onChange={setType}
                disabled={busy}
              />

              <FormSelect
                label="Course"
                value={courseId}
                options={courseOptions}
                onChange={setCourseId}
                disabled={busy}
              />

              <AssignmentDateField
                label="Deadline"
                value={deadline}
                onChange={setDeadline}
                disabled={busy}
              />

              <FormSelect
                label="Importance"
                value={priority}
                options={ASSIGNMENT_PRIORITY_OPTIONS}
                onChange={setPriority}
                disabled={busy}
              />

              <FormSelect
                label="Status"
                value={status}
                options={ASSIGNMENT_STATUS_OPTIONS}
                onChange={setStatus}
                disabled={busy}
              />
            </ScrollView>
          </KeyboardAvoidingView>

          <View style={[styles.actions, { gap: spacing.sm, borderTopColor: colors.border }]}>
            <Pressable
              onPress={onClose}
              disabled={busy}
              style={[styles.secondaryBtn, { borderColor: colors.border, borderRadius: radius.md }]}
              accessibilityRole="button"
            >
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: colors.accent,
                  borderRadius: radius.md,
                  opacity: canSubmit ? 1 : 0.45,
                },
              ]}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[typography.caption, styles.primaryLabel]}>Create</Text>
              )}
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
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 12,
    alignSelf: "center",
  },
  flex: {
    flexShrink: 1,
  },
  scroll: {
    flexGrow: 0,
  },
  label: {
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  primaryBtn: {
    minWidth: 96,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryLabel: {
    color: "#fff",
    fontWeight: "700",
  },
});
