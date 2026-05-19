import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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
import { AssignmentDetailHeader } from "@/features/assignments/components/AssignmentDetailHeader";
import { AssignmentFormFields } from "@/features/assignments/components/AssignmentFormFields";
import { AssignmentTodosSection } from "@/features/assignments/components/AssignmentTodosSection";
import {
  assignmentToFormValues,
  type AssignmentFormValues,
} from "@/features/assignments/lib/assignmentFormUtils";
import { useAssignmentDetail } from "@/features/assignments/hooks/useAssignmentDetail";
import { useUpdateAssignment } from "@/features/assignments/hooks/useUpdateAssignment";
import { useTheme } from "@/hooks";

function paramString(value: string | string[] | undefined): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

export function AssignmentDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    assignmentId: string | string[];
    id?: string | string[];
    courseTitle?: string | string[];
  }>();

  const routeCourseId = paramString(params.id);
  const assignmentId = paramString(params.assignmentId);

  const { colors, spacing, typography } = useTheme();
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

  const handleSave = useCallback(() => {
    if (!draft || !assignmentId || !routeCourseId) return;
    if (draft.title.trim().length === 0) return;

    updateMutation.mutate(
      {
        routeCourseId,
        assignmentId,
        input: {
          title: draft.title.trim(),
          type: draft.type,
          courseId: draft.courseId,
          deadline: draft.deadline,
          priority: draft.priority,
          status: draft.status,
        },
      },
      {
        onSuccess: () => {
          setEditing(false);
        },
      },
    );
  }, [assignmentId, draft, routeCourseId, updateMutation]);

  const busy = updateMutation.isPending;
  const titleValid = (draft?.title.trim().length ?? 0) > 0;
  const canSave = titleValid && !busy;

  const renderBody = () => {
    if (detailQuery.isPending) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }

    if (detailQuery.isError || !assignment || !draft) {
      return (
        <View style={styles.centered}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Assignment not found.
          </Text>
        </View>
      );
    }

    return (
      <>
        <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing.md }]}>
          {editing ? "Edit assignment" : assignment.title}
        </Text>

        <AssignmentFormFields
          mode={editing ? "edit" : "view"}
          values={draft}
          defaultCourseId={routeCourseId || draft.courseId}
          disabled={busy}
          onChangeTitle={(title) => patchDraft({ title })}
          onChangeType={(type) => patchDraft({ type })}
          onChangeCourseId={(courseId) => patchDraft({ courseId })}
          onChangeDeadline={(deadline) => patchDraft({ deadline })}
          onChangePriority={(priority) => patchDraft({ priority })}
          onChangeStatus={(status) => patchDraft({ status })}
        />

        <AssignmentTodosSection />
      </>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={[styles.scroll, { padding: spacing.lg, paddingBottom: spacing.xxl }]}
            keyboardShouldPersistTaps="handled"
          >
            <AssignmentDetailHeader
              editing={editing}
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
    </>
  );
}

const styles = StyleSheet.create({
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
