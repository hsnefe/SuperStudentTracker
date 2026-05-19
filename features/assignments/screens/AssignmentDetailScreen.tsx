import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AssignmentStripCardBackground,
  parseCardVariant,
} from "@/components/course/AssignmentStripCardBackground";
import { AssignmentDetailHeader } from "@/features/assignments/components/AssignmentDetailHeader";
import { AssignmentDetailHero } from "@/features/assignments/components/AssignmentDetailHero";
import { AssignmentFormFields } from "@/features/assignments/components/AssignmentFormFields";
import { AssignmentTodosSection } from "@/features/assignments/components/AssignmentTodosSection";
import {
  assignmentToFormValues,
  statusLabel,
  type AssignmentFormValues,
} from "@/features/assignments/lib/assignmentFormUtils";
import { useAssignmentDetail } from "@/features/assignments/hooks/useAssignmentDetail";
import { useUpdateAssignment } from "@/features/assignments/hooks/useUpdateAssignment";
import { useTheme } from "@/hooks";
import type { AssignmentPriority, UpdateAssignmentInput } from "@/types";

function paramString(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

function toUpdateInput(values: AssignmentFormValues): UpdateAssignmentInput {
  return {
    title: values.title.trim(),
    type: values.type,
    courseId: values.courseId,
    deadline: values.deadline,
    priority: values.priority,
    status: values.status,
  };
}

export function AssignmentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    assignmentId: string | string[];
    id?: string | string[];
    courseTitle?: string | string[];
    cardVariant?: string | string[];
  }>();

  const routeCourseId = paramString(params.id);
  const assignmentId = paramString(params.assignmentId);
  const cardVariant = parseCardVariant(params.cardVariant);

  const { spacing, typography } = useTheme();
  const detailQuery = useAssignmentDetail(routeCourseId, assignmentId);
  const updateMutation = useUpdateAssignment();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AssignmentFormValues | null>(null);

  const assignment = detailQuery.data;

  useEffect(() => {
    if (!editing && assignment) {
      setDraft(assignmentToFormValues(assignment));
    }
  }, [assignment, editing]);

  const startEdit = useCallback(() => {
    if (!assignment) return;
    setDraft(assignmentToFormValues(assignment));
    setEditing(true);
  }, [assignment]);

  const cancelEdit = useCallback(() => {
    if (assignment) {
      setDraft(assignmentToFormValues(assignment));
    }
    setEditing(false);
  }, [assignment]);

  const patchDraft = useCallback((patch: Partial<AssignmentFormValues>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const persistValues = useCallback(
    (values: AssignmentFormValues, onSuccess?: () => void) => {
      if (!assignmentId || !routeCourseId || values.title.trim().length === 0) return;
      updateMutation.mutate(
        {
          routeCourseId,
          assignmentId,
          input: toUpdateInput(values),
        },
        { onSuccess },
      );
    },
    [assignmentId, routeCourseId, updateMutation],
  );

  const handlePriorityCycle = useCallback(
    (next: AssignmentPriority) => {
      if (!draft) return;
      const nextValues = { ...draft, priority: next };
      setDraft(nextValues);
      persistValues(nextValues);
    },
    [draft, persistValues],
  );

  const handleSave = useCallback(() => {
    if (!draft) return;
    persistValues(draft, () => setEditing(false));
  }, [draft, persistValues]);

  const busy = updateMutation.isPending;
  const titleValid = (draft?.title.trim().length ?? 0) > 0;
  const canSave = titleValid && !busy;

  const renderBody = () => {
    if (detailQuery.isPending) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color="#FFC85C" />
        </View>
      );
    }

    if (detailQuery.isError || !assignment || !draft) {
      return (
        <View style={styles.centered}>
          <Text style={[typography.body, { color: "rgba(255,255,255,0.75)" }]}>
            Assignment not found.
          </Text>
        </View>
      );
    }

    return (
      <>
        <AssignmentDetailHero
          variant={cardVariant}
          mode={editing ? "edit" : "view"}
          values={draft}
          defaultCourseId={routeCourseId || draft.courseId}
          disabled={busy}
          onChangeTitle={(title) => patchDraft({ title })}
          onChangeType={(type) => patchDraft({ type })}
          onChangeCourseId={(courseId) => patchDraft({ courseId })}
          onPriorityCycle={handlePriorityCycle}
        />

        <AssignmentFormFields
          mode={editing ? "edit" : "view"}
          fields="secondary"
          variant={cardVariant}
          values={draft}
          defaultCourseId={routeCourseId || draft.courseId}
          disabled={busy}
          onChangeDeadline={(deadline) => patchDraft({ deadline })}
        />

        <AssignmentTodosSection variant={cardVariant} />
      </>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <View style={styles.root}>
        <AssignmentStripCardBackground variant={cardVariant} style={StyleSheet.absoluteFill} borderRadius={0} />

        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={[
                styles.scroll,
                { padding: spacing.lg, paddingBottom: spacing.xxl },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              <AssignmentDetailHeader
                variant={cardVariant}
                editing={editing}
                statusLabel={draft ? statusLabel(draft.status) : ""}
                editDisabled={!assignment || detailQuery.isPending}
                busy={busy}
                canSave={canSave}
                onBack={() => router.back()}
                onEdit={startEdit}
                onCancel={cancelEdit}
                onSave={handleSave}
              />

              {renderBody()}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0d0806",
  },
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
});
