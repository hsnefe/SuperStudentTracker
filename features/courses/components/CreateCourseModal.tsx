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
import { CourseScheduleEditor } from "@/components/CourseScheduleEditor";
import { GradeBreakdownEditor } from "@/components/GradeBreakdownEditor";
import { DEFAULT_CREATE_GRADE_ROWS } from "@/constants/courseDetailMock";
import { parseAbsenceHours } from "@/lib/courseForm";
import { parseGradeDrafts, toGradeDraft, weightsValid } from "@/lib/gradeBreakdown";
import { useTheme } from "@/hooks";
import type { CreateCourseInput, CreateCourseScheduleSlot } from "@/types";

type Props = {
  visible: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: CreateCourseInput) => void;
};

const MODAL_BASE_MAX_WIDTH = 520;
const MODAL_MAX_WIDTH = MODAL_BASE_MAX_WIDTH * 3;

export function CreateCourseModal({ visible, busy, onClose, onSubmit }: Props) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const { colors, spacing, typography, radius } = useTheme();

  const modalWidth = Math.min(screenW - 32, MODAL_MAX_WIDTH);
  const modalContentWidth = modalWidth - 40;

  const [title, setTitle] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [absenceInput, setAbsenceInput] = useState("3");
  const [gradeDraftRows, setGradeDraftRows] = useState(() =>
    DEFAULT_CREATE_GRADE_ROWS.map(toGradeDraft),
  );
  const [scheduleSlots, setScheduleSlots] = useState<CreateCourseScheduleSlot[]>([]);
  const [showGradeWeightError, setShowGradeWeightError] = useState(false);

  const resetForm = useCallback(() => {
    setTitle("");
    setLecturerName("");
    setAbsenceInput("3");
    setGradeDraftRows(DEFAULT_CREATE_GRADE_ROWS.map(toGradeDraft));
    setScheduleSlots([]);
    setShowGradeWeightError(false);
  }, []);

  useEffect(() => {
    if (!visible) resetForm();
  }, [visible, resetForm]);

  const parsedGrades = useMemo(() => parseGradeDrafts(gradeDraftRows), [gradeDraftRows]);
  const absenceHours = useMemo(() => parseAbsenceHours(absenceInput), [absenceInput]);

  const gradesValid =
    parsedGrades !== null && weightsValid(parsedGrades) && gradeDraftRows.length > 0;
  const absenceValid = absenceHours !== null;
  const titleValid = title.trim().length > 0;
  const canSubmit = titleValid && gradesValid && absenceValid && !busy;

  const handleSubmit = useCallback(() => {
    if (!canSubmit || !parsedGrades || absenceHours === null) {
      if (!gradesValid) setShowGradeWeightError(true);
      return;
    }
    onSubmit({
      title: title.trim(),
      lecturerName: lecturerName.trim(),
      absenceToleranceHours: absenceHours,
      gradeRows: parsedGrades,
      scheduleSlots,
    });
  }, [
    absenceHours,
    canSubmit,
    gradesValid,
    lecturerName,
    onSubmit,
    parsedGrades,
    scheduleSlots,
    title,
  ]);

  const inputStyle = [
    styles.input,
    typography.body,
    { color: colors.textPrimary, borderColor: colors.border, borderRadius: radius.md },
  ];

  const modalMaxHeight = Math.min(screenH * 0.88, 720);

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
          <Text style={[typography.title, { color: colors.textPrimary }]}>Yeni ders</Text>

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
                  Ders Adı
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Örn. Veri Yapıları"
                  placeholderTextColor={colors.textMuted}
                  editable={!busy}
                  style={inputStyle}
                />
              </View>

              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.caption, styles.label, { color: colors.textSecondary }]}>
                  Öğretim Üyesi
                </Text>
                <TextInput
                  value={lecturerName}
                  onChangeText={setLecturerName}
                  placeholder="Örn. Dr. Ayşe Yılmaz"
                  placeholderTextColor={colors.textMuted}
                  editable={!busy}
                  style={inputStyle}
                />
              </View>

              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.caption, styles.label, { color: colors.textSecondary }]}>
                  Devamsızlık Toleransı (saat)
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
                    Geçerli bir saat değeri girin (0 veya üzeri).
                  </Text>
                ) : null}
              </View>

              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.caption, styles.label, { color: colors.textSecondary }]}>
                  Puan Dağılımı
                </Text>
                <GradeBreakdownEditor
                  mode="edit"
                  draftRows={gradeDraftRows}
                  onDraftChange={setGradeDraftRows}
                  showWeightError={showGradeWeightError || (parsedGrades !== null && !weightsValid(parsedGrades))}
                  disabled={busy}
                  wide
                />
              </View>

              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.caption, styles.label, { color: colors.textSecondary }]}>
                  Ders Programı
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

          <View style={[styles.actions, { gap: spacing.sm, borderTopColor: colors.border }]}>
            <Pressable
              onPress={onClose}
              disabled={busy}
              style={[styles.secondaryBtn, { borderColor: colors.border, borderRadius: radius.md }]}
              accessibilityRole="button"
            >
              <Text style={[typography.caption, { color: colors.textSecondary }]}>İptal</Text>
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
                <Text style={[typography.caption, styles.primaryLabel]}>Oluştur</Text>
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
