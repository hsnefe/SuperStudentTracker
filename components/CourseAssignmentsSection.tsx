import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { AssignmentCard } from "@/components/AssignmentCard";
import { CreateAssignmentModal } from "@/features/assignments/components/CreateAssignmentModal";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCreateAssignment } from "@/features/assignments/hooks/useCreateAssignment";
import { loadAssignments } from "@/lib/persistence/courseAssignments";
import { useTheme } from "@/hooks";
import type { Assignment, CreateAssignmentInput } from "@/types";

type Props = {
  courseId: string;
  courseTitle: string;
};

export function CourseAssignmentsSection({ courseId, courseTitle }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { colors, typography, spacing, radius } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(319, Math.max(260, windowWidth * 0.78));
  const cardGap = 16;
  const createAssignment = useCreateAssignment();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const refreshAssignments = useCallback(() => {
    if (!user) return;
    setLoading(true);
    loadAssignments(user.uid, courseId).then((list) => {
      setAssignments(list);
      setLoading(false);
    });
  }, [courseId, user]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let cancelled = false;
      setLoading(true);
      loadAssignments(user.uid, courseId).then((list) => {
        if (!cancelled) {
          setAssignments(list);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [courseId, user]),
  );

  const openAdd = () => setCreateModalVisible(true);

  const handleCreate = async (input: CreateAssignmentInput) => {
    try {
      await createAssignment.mutateAsync(input);
      setCreateModalVisible(false);
      refreshAssignments();
    } catch {
      setCreateModalVisible(false);
    }
  };

  const openAssignment = (a: Assignment) => {
    router.push(
      `/course/${encodeURIComponent(courseId)}/assignment/${encodeURIComponent(a.id)}?courseTitle=${encodeURIComponent(courseTitle)}`,
    );
  };

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.lg,
          gap: spacing.sm,
        },
      ]}
    >
      <Text style={[typography.heading, { color: colors.textPrimary }]}>Assignments</Text>

      {loading ? (
        <ActivityIndicator color={colors.highlight} style={{ paddingVertical: spacing.lg }} />
      ) : (
        <View style={{ marginHorizontal: -spacing.lg, marginTop: spacing.sm }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              gap: cardGap,
              paddingBottom: spacing.xs,
            }}
          >
            {assignments.map((a) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                width={cardWidth}
                onPress={() => openAssignment(a)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.footerRow}>
        <Pressable
          onPress={openAdd}
          accessibilityRole="button"
          accessibilityLabel="Add assignment"
          hitSlop={12}
          style={styles.addFab}
        >
          <MaterialIcons name="add" size={28} color={colors.highlight} />
        </Pressable>
      </View>

      <CreateAssignmentModal
        visible={createModalVisible}
        busy={createAssignment.isPending}
        defaultCourseId={courseId}
        onClose={() => {
          if (!createAssignment.isPending) setCreateModalVisible(false);
        }}
        onSubmit={handleCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  addFab: {
    padding: 6,
  },
});
