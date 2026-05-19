import { StyleSheet, Text, TextInput, View } from "react-native";
import { AssignmentDateField } from "@/components/form/AssignmentDateField";
import { FormSelect } from "@/components/form/FormSelect";
import {
  ASSIGNMENT_PRIORITY_OPTIONS,
  ASSIGNMENT_STATUS_OPTIONS,
  ASSIGNMENT_TYPE_OPTIONS,
} from "@/constants/assignmentOptions";
import {
  courseLabelFromOptions,
  formatDeadlineDisplay,
  priorityLabel,
  statusLabel,
  typeLabel,
  useAssignmentCourseOptions,
  type AssignmentFormValues,
} from "@/features/assignments/lib/assignmentFormUtils";
import { useTheme } from "@/hooks";

type Props = {
  mode: "view" | "edit";
  values: AssignmentFormValues;
  defaultCourseId: string;
  disabled?: boolean;
  onChangeTitle?: (title: string) => void;
  onChangeType?: (type: AssignmentFormValues["type"]) => void;
  onChangeCourseId?: (courseId: string) => void;
  onChangeDeadline?: (deadline: string) => void;
  onChangePriority?: (priority: AssignmentFormValues["priority"]) => void;
  onChangeStatus?: (status: AssignmentFormValues["status"]) => void;
};

function ViewField({ label, value }: { label: string; value: string }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.caption, styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[typography.body, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

export function AssignmentFormFields({
  mode,
  values,
  defaultCourseId,
  disabled,
  onChangeTitle,
  onChangeType,
  onChangeCourseId,
  onChangeDeadline,
  onChangePriority,
  onChangeStatus,
}: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const courseOptions = useAssignmentCourseOptions(defaultCourseId);

  const inputStyle = [
    styles.input,
    typography.body,
    { color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.md },
  ];

  if (mode === "view") {
    return (
      <View style={{ gap: spacing.md }}>
        <ViewField label="Assignment name" value={values.title} />
        <ViewField label="Assignment type" value={typeLabel(values.type)} />
        <ViewField
          label="Course"
          value={courseLabelFromOptions(values.courseId, courseOptions)}
        />
        <ViewField label="Deadline" value={formatDeadlineDisplay(values.deadline)} />
        <ViewField label="Importance" value={priorityLabel(values.priority)} />
        <ViewField label="Status" value={statusLabel(values.status)} />
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.caption, styles.label, { color: colors.textSecondary }]}>
          Assignment name
        </Text>
        <TextInput
          value={values.title}
          onChangeText={onChangeTitle}
          placeholder="e.g. Final essay"
          placeholderTextColor={colors.textMuted}
          editable={!disabled}
          style={inputStyle}
        />
      </View>

      <FormSelect
        label="Assignment type"
        value={values.type}
        options={ASSIGNMENT_TYPE_OPTIONS}
        onChange={(v) => onChangeType?.(v)}
        disabled={disabled}
      />

      <FormSelect
        label="Course"
        value={values.courseId}
        options={courseOptions}
        onChange={(v) => onChangeCourseId?.(v)}
        disabled={disabled}
      />

      <AssignmentDateField
        label="Deadline"
        value={values.deadline}
        onChange={(v) => onChangeDeadline?.(v)}
        disabled={disabled}
      />

      <FormSelect
        label="Importance"
        value={values.priority}
        options={ASSIGNMENT_PRIORITY_OPTIONS}
        onChange={(v) => onChangePriority?.(v)}
        disabled={disabled}
      />

      <FormSelect
        label="Status"
        value={values.status}
        options={ASSIGNMENT_STATUS_OPTIONS}
        onChange={(v) => onChangeStatus?.(v)}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
