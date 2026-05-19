import { StyleSheet, Text, TextInput, View } from "react-native";
import type { AssignmentStripCardVariant } from "@/components/course/AssignmentStripCardBackground";
import {
  STRIP_CARD_META_SEPARATOR,
  stripCardMetaColor,
  stripCardTitleColor,
} from "@/components/course/assignmentStripCardTypography";
import { FormSelect } from "@/components/form/FormSelect";
import { ASSIGNMENT_TYPE_OPTIONS } from "@/constants/assignmentOptions";
import { AssignmentPriorityBadge } from "@/features/assignments/components/AssignmentPriorityBadge";
import {
  courseLabelFromOptions,
  type AssignmentFormValues,
  typeLabel,
  useAssignmentCourseOptions,
} from "@/features/assignments/lib/assignmentFormUtils";
import type { AssignmentPriority } from "@/types";

type Props = {
  variant: AssignmentStripCardVariant;
  mode: "view" | "edit";
  values: AssignmentFormValues;
  defaultCourseId: string;
  disabled?: boolean;
  onChangeTitle?: (title: string) => void;
  onChangeType?: (type: AssignmentFormValues["type"]) => void;
  onChangeCourseId?: (courseId: string) => void;
  onPriorityCycle: (next: AssignmentPriority) => void;
};

export function AssignmentDetailHero({
  variant,
  mode,
  values,
  defaultCourseId,
  disabled,
  onChangeTitle,
  onChangeType,
  onChangeCourseId,
  onPriorityCycle,
}: Props) {
  const titleColor = stripCardTitleColor(variant);
  const metaColor = stripCardMetaColor(variant);
  const courseOptions = useAssignmentCourseOptions(defaultCourseId);
  const courseName = courseLabelFromOptions(values.courseId, courseOptions);

  return (
    <View style={styles.root}>
      <View style={styles.titleRow}>
        <View style={styles.titleWithPriority}>
          {mode === "view" ? (
            <Text style={[styles.title, { color: titleColor }]}>{values.title}</Text>
          ) : (
            <TextInput
              value={values.title}
              onChangeText={onChangeTitle}
              placeholder="Assignment name"
              placeholderTextColor="rgba(255,255,255,0.45)"
              editable={!disabled}
              style={[
                styles.titleInput,
                { color: titleColor, borderColor: "rgba(255,255,255,0.35)" },
              ]}
            />
          )}
          <AssignmentPriorityBadge
            priority={values.priority}
            disabled={disabled}
            labelColor={titleColor}
            onCycle={onPriorityCycle}
          />
        </View>
      </View>

      {mode === "view" ? (
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: metaColor }]}>{typeLabel(values.type)}</Text>
          <Text style={[styles.separator, { color: STRIP_CARD_META_SEPARATOR }]}>·</Text>
          <Text style={[styles.meta, styles.metaFlex, { color: metaColor }]} numberOfLines={1}>
            {courseName}
          </Text>
        </View>
      ) : (
        <View style={styles.metaRowEdit}>
          <View style={styles.metaEditCell}>
            <FormSelect
              label="Assignment type"
              hideLabel
              value={values.type}
              options={ASSIGNMENT_TYPE_OPTIONS}
              onChange={(v) => onChangeType?.(v)}
              disabled={disabled}
            />
          </View>
          <View style={styles.metaEditCell}>
            <FormSelect
              label="Course"
              hideLabel
              value={values.courseId}
              options={courseOptions}
              onChange={(v) => onChangeCourseId?.(v)}
              disabled={disabled}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  titleWithPriority: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    maxWidth: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
    flexShrink: 1,
  },
  titleInput: {
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 160,
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  metaRowEdit: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  metaEditCell: {
    flex: 1,
    minWidth: 120,
  },
  meta: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  metaFlex: {
    flexShrink: 1,
  },
  separator: {
    fontSize: 14,
    fontWeight: "700",
  },
});
