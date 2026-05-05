import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { loadAssignments, saveAssignments } from "@/lib/persistence/courseAssignments";
import { useTheme } from "@/hooks";

function newAssignmentId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function AddCourseAssignmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const idRaw = params.id;
  const courseId = Array.isArray(idRaw) ? idRaw[0] : idRaw ?? "";

  const { colors, spacing, typography } = useTheme();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed.length || !courseId.length) return;
    setBusy(true);
    try {
      const existing = await loadAssignments(courseId);
      const next = [
        ...existing,
        {
          id: newAssignmentId(),
          courseId,
          title: trimmed,
          description: "",
          tasks: [],
        },
      ];
      await saveAssignments(courseId, next);
      router.dismiss();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "New assignment",
          presentation: "modal",
          headerRight: () => (
            <Pressable
              onPress={() => router.dismiss()}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={{ paddingHorizontal: spacing.sm }}
            >
              <MaterialIcons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Title-only assignment; you can add description and tasks later.
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Assignment title"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              typography.body,
              { color: colors.textPrimary, borderColor: colors.border },
            ]}
          />
          <Pressable
            onPress={submit}
            disabled={busy || !title.trim().length}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: colors.highlight,
                opacity: busy || !title.trim().length ? 0.45 : 1,
              },
            ]}
            accessibilityRole="button"
          >
            {busy ? (
              <ActivityIndicator color={colors.primaryDark} />
            ) : (
              <Text style={[typography.caption, { color: colors.primaryDark, fontWeight: "700" }]}>
                Create
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryBtn: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
});
