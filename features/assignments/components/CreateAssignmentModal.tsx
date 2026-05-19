import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { AssignmentFormFields } from "@/features/assignments/components/AssignmentFormFields";
import {
  todayIsoDate,
  type AssignmentFormValues,
} from "@/features/assignments/lib/assignmentFormUtils";
import {
  DEFAULT_ASSIGNMENT_PRIORITY,
  DEFAULT_ASSIGNMENT_STATUS,
  DEFAULT_ASSIGNMENT_TYPE,
} from "@/constants/assignmentOptions";
import { useTheme } from "@/hooks";
import type { CreateAssignmentInput } from "@/types";

type Props = {
  visible: boolean;
  busy: boolean;
  defaultCourseId: string;
  onClose: () => void;
  onSubmit: (input: CreateAssignmentInput) => void;
};

const MODAL_BASE_MAX_WIDTH = 520;
const MODAL_MAX_WIDTH = MODAL_BASE_MAX_WIDTH * 3;

const EMPTY_FORM: AssignmentFormValues = {
  title: "",
  type: DEFAULT_ASSIGNMENT_TYPE,
  courseId: "",
  deadline: "",
  priority: DEFAULT_ASSIGNMENT_PRIORITY,
  status: DEFAULT_ASSIGNMENT_STATUS,
};

export function CreateAssignmentModal({
  visible,
  busy,
  defaultCourseId,
  onClose,
  onSubmit,
}: Props) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { colors, spacing, typography, radius } = useTheme();

  const modalWidth = Math.min(screenW - 32, MODAL_MAX_WIDTH);
  const modalMaxHeight = Math.min(screenH * 0.88, 720);

  const [values, setValues] = useState<AssignmentFormValues>({
    ...EMPTY_FORM,
    courseId: defaultCourseId,
    deadline: todayIsoDate(),
  });

  const resetForm = useCallback(() => {
    setValues({
      ...EMPTY_FORM,
      courseId: defaultCourseId,
      deadline: todayIsoDate(),
    });
  }, [defaultCourseId]);

  useEffect(() => {
    if (visible) {
      setValues((prev) => ({ ...prev, courseId: defaultCourseId }));
    } else {
      resetForm();
    }
  }, [visible, defaultCourseId, resetForm]);

  const titleValid = values.title.trim().length > 0;
  const canSubmit = titleValid && !busy;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    onSubmit({
      title: values.title.trim(),
      type: values.type,
      courseId: values.courseId,
      deadline: values.deadline,
      priority: values.priority,
      status: values.status,
    });
  }, [canSubmit, onSubmit, values]);

  const patch = useCallback((patchValues: Partial<AssignmentFormValues>) => {
    setValues((prev) => ({ ...prev, ...patchValues }));
  }, []);

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
              <AssignmentFormFields
                mode="edit"
                values={values}
                defaultCourseId={defaultCourseId}
                disabled={busy}
                onChangeTitle={(title) => patch({ title })}
                onChangeType={(type) => patch({ type })}
                onChangeCourseId={(courseId) => patch({ courseId })}
                onChangeDeadline={(deadline) => patch({ deadline })}
                onChangePriority={(priority) => patch({ priority })}
                onChangeStatus={(status) => patch({ status })}
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
