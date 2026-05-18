import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { CourseScheduleEditor } from "@/components/CourseScheduleEditor";
import { parseAbsenceHours } from "@/lib/courseForm";
import { useTheme } from "@/hooks";
import type { CourseEditSnapshot, CreateCourseScheduleSlot, UpdateCourseInput } from "@/types";

const MODAL_BASE_MAX_WIDTH = 520;
const MODAL_MAX_WIDTH = MODAL_BASE_MAX_WIDTH * 3;
const PLACEHOLDER = require("@/assets/images/partial-react-logo.png");

type Props = {
  visible: boolean;
  busy: boolean;
  loading: boolean;
  loadError: Error | null;
  initial: CourseEditSnapshot | undefined;
  onClose: () => void;
  onSubmit: (input: UpdateCourseInput) => void;
  onDelete: () => void;
};

type FormSnapshot = {
  title: string;
  lecturerName: string;
  absenceInput: string;
  scheduleSlots: CreateCourseScheduleSlot[];
  imageKey: string;
};

function imageKey(
  remoteUrl: string | null,
  localUri: string | null,
  removed: boolean,
): string {
  if (removed) return "removed";
  if (localUri) return `local:${localUri}`;
  return `remote:${remoteUrl ?? ""}`;
}

export function EditCourseModal({
  visible,
  busy,
  loading,
  loadError,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: Props) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { colors, spacing, typography, radius } = useTheme();

  const modalWidth = Math.min(screenW - 32, MODAL_MAX_WIDTH);
  const modalContentWidth = modalWidth - 40;

  const [title, setTitle] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [absenceInput, setAbsenceInput] = useState("0");
  const [scheduleSlots, setScheduleSlots] = useState<CreateCourseScheduleSlot[]>([]);
  const [pickedLocalUri, setPickedLocalUri] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const baselineRef = useRef<FormSnapshot | null>(null);

  const resetFromInitial = useCallback((data: CourseEditSnapshot) => {
    setTitle(data.title);
    setLecturerName(data.lecturerName);
    setAbsenceInput(String(data.absenceToleranceHours));
    setScheduleSlots(data.scheduleSlots);
    setPickedLocalUri(null);
    setRemoveImage(false);
    baselineRef.current = {
      title: data.title,
      lecturerName: data.lecturerName,
      absenceInput: String(data.absenceToleranceHours),
      scheduleSlots: data.scheduleSlots,
      imageKey: imageKey(data.imageUrl, null, false),
    };
  }, []);

  useEffect(() => {
    if (visible && initial) {
      resetFromInitial(initial);
    }
    if (!visible) {
      baselineRef.current = null;
    }
  }, [visible, initial, resetFromInitial]);

  const absenceHours = useMemo(() => parseAbsenceHours(absenceInput), [absenceInput]);
  const absenceValid = absenceHours !== null;
  const titleValid = title.trim().length > 0;
  const canSubmit = titleValid && absenceValid && !busy && !loading && Boolean(initial);

  const previewUri = removeImage
    ? null
    : pickedLocalUri ?? initial?.imageUrl ?? null;

  const isDirty = useMemo(() => {
    const baseline = baselineRef.current;
    if (!baseline) return false;
    const currentKey = imageKey(initial?.imageUrl ?? null, pickedLocalUri, removeImage);
    if (baseline.title !== title.trim()) return true;
    if (baseline.lecturerName !== lecturerName.trim()) return true;
    if (baseline.absenceInput !== absenceInput.trim()) return true;
    if (baseline.imageKey !== currentKey) return true;
    if (baseline.scheduleSlots.length !== scheduleSlots.length) return true;
    return baseline.scheduleSlots.some((slot, i) => {
      const other = scheduleSlots[i];
      if (!other) return true;
      return (
        slot.id !== other.id ||
        slot.weekday !== other.weekday ||
        slot.startMinutes !== other.startMinutes ||
        slot.endMinutes !== other.endMinutes ||
        (slot.location ?? "") !== (other.location ?? "")
      );
    });
  }, [
    absenceInput,
    initial?.imageUrl,
    lecturerName,
    pickedLocalUri,
    removeImage,
    scheduleSlots,
    title,
  ]);

  const requestClose = useCallback(() => {
    if (busy) return;
    if (isDirty) {
      Alert.alert(
        "Unsaved changes",
        "Your changes will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Discard", style: "destructive", onPress: onClose },
        ],
      );
      return;
    }
    onClose();
  }, [busy, isDirty, onClose]);

  const pickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Allow photo library access to choose a cover image.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPickedLocalUri(result.assets[0].uri);
      setRemoveImage(false);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setPickedLocalUri(null);
    setRemoveImage(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit || absenceHours === null) return;

    let imageUri: string | null | undefined;
    if (removeImage) {
      imageUri = null;
    } else if (pickedLocalUri) {
      imageUri = pickedLocalUri;
    }

    onSubmit({
      title: title.trim(),
      lecturerName: lecturerName.trim(),
      absenceToleranceHours: absenceHours,
      scheduleSlots,
      ...(imageUri !== undefined ? { imageUri } : {}),
    });
  }, [
    absenceHours,
    canSubmit,
    lecturerName,
    onSubmit,
    pickedLocalUri,
    removeImage,
    scheduleSlots,
    title,
  ]);

  const confirmDelete = useCallback(() => {
    if (busy) return;
    Alert.alert(
      "Delete course",
      "This course and its schedule, grades, and assignments will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ],
    );
  }, [busy, onDelete]);

  const inputStyle = [
    styles.input,
    typography.body,
    { color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.md },
  ];

  const modalMaxHeight = Math.min(screenH * 0.88, 720);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={requestClose}
    >
      <Pressable style={styles.backdrop} onPress={requestClose}>
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
          <Text style={[typography.title, { color: colors.textPrimary }]}>Edit course</Text>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : loadError ? (
            <View style={styles.centered}>
              <Text style={[typography.body, { color: colors.warning, textAlign: "center" }]}>
                {loadError.message}
              </Text>
              <Pressable onPress={onClose} style={{ marginTop: spacing.md }}>
                <Text style={[typography.caption, { color: colors.accent }]}>Close</Text>
              </Pressable>
            </View>
          ) : (
            <>
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
                    <Text
                      style={[typography.caption, styles.label, { color: colors.textSecondary }]}
                    >
                      Course cover
                    </Text>
                    <Image
                      source={previewUri ? { uri: previewUri } : PLACEHOLDER}
                      style={[styles.coverPreview, { borderRadius: radius.md }]}
                      resizeMode="cover"
                    />
                    <View style={styles.imageActions}>
                      <Pressable
                        onPress={pickImage}
                        disabled={busy}
                        style={[styles.imageBtn, { borderColor: colors.border, borderRadius: radius.md }]}
                      >
                        <Text style={[typography.caption, { color: colors.textPrimary }]}>
                          Choose from gallery
                        </Text>
                      </Pressable>
                      {(previewUri || initial?.imageUrl) && !removeImage ? (
                        <Pressable
                          onPress={handleRemoveImage}
                          disabled={busy}
                          style={[styles.imageBtn, { borderColor: colors.border, borderRadius: radius.md }]}
                        >
                          <Text style={[typography.caption, { color: colors.warning }]}>
                            Remove image
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>

                  <View style={{ gap: spacing.xs }}>
                    <Text
                      style={[typography.caption, styles.label, { color: colors.textSecondary }]}
                    >
                      Course name
                    </Text>
                    <TextInput
                      value={title}
                      onChangeText={setTitle}
                      placeholder="e.g. Data Structures"
                      placeholderTextColor={colors.textMuted}
                      editable={!busy}
                      style={inputStyle}
                    />
                  </View>

                  <View style={{ gap: spacing.xs }}>
                    <Text
                      style={[typography.caption, styles.label, { color: colors.textSecondary }]}
                    >
                      Instructor
                    </Text>
                    <TextInput
                      value={lecturerName}
                      onChangeText={setLecturerName}
                      placeholder="e.g. Dr. Jane Smith"
                      placeholderTextColor={colors.textMuted}
                      editable={!busy}
                      style={inputStyle}
                    />
                  </View>

                  <View style={{ gap: spacing.xs }}>
                    <Text
                      style={[typography.caption, styles.label, { color: colors.textSecondary }]}
                    >
                      Absence tolerance (hours)
                    </Text>
                    <TextInput
                      value={absenceInput}
                      onChangeText={setAbsenceInput}
                      placeholder="3"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      editable={!busy}
                      style={inputStyle}
                    />
                    {absenceInput.trim().length > 0 && !absenceValid ? (
                      <Text style={[typography.caption, { color: colors.warning }]}>
                        Enter a valid number of hours (0 or greater).
                      </Text>
                    ) : null}
                  </View>

                  <View style={{ gap: spacing.xs }}>
                    <Text
                      style={[typography.caption, styles.label, { color: colors.textSecondary }]}
                    >
                      Class schedule
                    </Text>
                    <CourseScheduleEditor
                      slots={scheduleSlots}
                      onChange={setScheduleSlots}
                      disabled={busy}
                      layoutWidth={modalContentWidth}
                    />
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>

              <View style={[styles.actions, { borderTopColor: colors.border }]}>
                <Pressable
                  onPress={confirmDelete}
                  disabled={busy}
                  style={[
                    styles.secondaryBtn,
                    { borderColor: colors.danger, borderRadius: radius.md, opacity: busy ? 0.45 : 1 },
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={[typography.caption, { color: colors.danger, fontWeight: "700" }]}>
                    Delete course
                  </Text>
                </Pressable>

                <View style={[styles.actionsRight, { gap: spacing.sm }]}>
                  <Pressable
                    onPress={requestClose}
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
                      <Text style={[typography.caption, styles.primaryLabel]}>Save</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </>
          )}
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
  centered: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
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
  coverPreview: {
    width: "100%",
    aspectRatio: 9 / 16,
    maxHeight: 200,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  imageActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  imageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionsRight: {
    flexDirection: "row",
    alignItems: "center",
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
