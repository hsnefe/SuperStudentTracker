import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
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
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "@/hooks";
import type { CreateMaterialInput } from "@/types";

type UploadMode = "file" | "link";

type Props = {
  visible: boolean;
  busy: boolean;
  courseId: string;
  onClose: () => void;
  onSubmit: (input: CreateMaterialInput) => void;
};

const MODAL_BASE_MAX_WIDTH = 520;

export function UploadMaterialModal({ visible, busy, courseId, onClose, onSubmit }: Props) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { colors, spacing, typography, radius } = useTheme();

  const modalWidth = Math.min(screenW - 32, MODAL_BASE_MAX_WIDTH);
  const modalMaxHeight = Math.min(screenH * 0.88, 720);

  const [mode, setMode] = useState<UploadMode>("file");
  const [title, setTitle] = useState("");
  const [linkUri, setLinkUri] = useState("");
  const [pickedFile, setPickedFile] = useState<{
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  } | null>(null);

  const reset = useCallback(() => {
    setMode("file");
    setTitle("");
    setLinkUri("");
    setPickedFile(null);
  }, []);

  useEffect(() => {
    if (!visible) reset();
  }, [visible, reset]);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setPickedFile({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? undefined,
      size: asset.size ?? undefined,
    });
    if (!title.trim()) {
      const baseName = asset.name.replace(/\.[^.]+$/, "");
      setTitle(baseName);
    }
  };

  const titleValid = title.trim().length > 0;
  const fileValid = mode === "file" ? pickedFile != null : linkUri.trim().length > 0;
  const canSubmit = titleValid && fileValid && !busy;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (mode === "link") {
      onSubmit({
        courseId,
        title: title.trim(),
        uri: linkUri.trim(),
      });
      return;
    }
    if (!pickedFile) return;
    onSubmit({
      courseId,
      title: title.trim(),
      localFileUri: pickedFile.uri,
      fileName: pickedFile.name,
      mimeType: pickedFile.mimeType,
      sizeBytes: pickedFile.size,
    });
  };

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
          <Text style={[typography.title, { color: colors.textPrimary }]}>Add material</Text>

          <View style={[styles.modeRow, { gap: spacing.sm }]}>
            {(["file", "link"] as UploadMode[]).map((m) => {
              const active = mode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  disabled={busy}
                  style={[
                    styles.modeChip,
                    {
                      borderColor: active ? colors.accent : colors.border,
                      backgroundColor: active ? "rgba(255,101,63,0.12)" : "transparent",
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.caption,
                      { color: active ? colors.accent : colors.textSecondary, fontWeight: "700" },
                    ]}
                  >
                    {m === "file" ? "File" : "Link"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.flex}
          >
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.sm }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.caption, styles.label, { color: colors.textSecondary }]}>
                  TITLE
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  editable={!busy}
                  placeholder="Material title"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    {
                      borderColor: colors.border,
                      borderRadius: radius.md,
                      color: colors.textPrimary,
                    },
                  ]}
                />
              </View>

              {mode === "file" ? (
                <View style={{ gap: spacing.xs }}>
                  <Text style={[typography.caption, styles.label, { color: colors.textSecondary }]}>
                    FILE
                  </Text>
                  <Pressable
                    onPress={() => void pickFile()}
                    disabled={busy}
                    style={[
                      styles.pickBtn,
                      {
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        opacity: busy ? 0.5 : 1,
                      },
                    ]}
                  >
                    <MaterialIcons name="upload-file" size={22} color={colors.highlight} />
                    <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]} numberOfLines={2}>
                      {pickedFile?.name ?? "Choose a document"}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{ gap: spacing.xs }}>
                  <Text style={[typography.caption, styles.label, { color: colors.textSecondary }]}>
                    URL
                  </Text>
                  <TextInput
                    value={linkUri}
                    onChangeText={setLinkUri}
                    editable={!busy}
                    placeholder="https://…"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="none"
                    keyboardType="url"
                    style={[
                      styles.input,
                      {
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        color: colors.textPrimary,
                      },
                    ]}
                  />
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>

          <View style={[styles.actions, { gap: spacing.sm, borderTopColor: colors.border }]}>
            <Pressable
              onPress={onClose}
              disabled={busy}
              style={[styles.secondaryBtn, { borderColor: colors.border, borderRadius: radius.md }]}
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
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[typography.caption, styles.primaryLabel]}>Save</Text>
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
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modeRow: {
    flexDirection: "row",
  },
  modeChip: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  pickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
