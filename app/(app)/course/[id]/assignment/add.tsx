import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { CreateAssignmentModal } from "@/features/assignments/components/CreateAssignmentModal";
import { useCreateAssignment } from "@/features/assignments/hooks/useCreateAssignment";
import type { CreateAssignmentInput } from "@/types";

export default function AddCourseAssignmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const idRaw = params.id;
  const courseId = Array.isArray(idRaw) ? idRaw[0] : idRaw ?? "";
  const createAssignment = useCreateAssignment();

  const handleSubmit = async (input: CreateAssignmentInput) => {
    try {
      await createAssignment.mutateAsync(input);
      router.dismiss();
    } catch {
      router.dismiss();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal" }} />
      <View style={{ flex: 1 }}>
        <CreateAssignmentModal
          visible
          busy={createAssignment.isPending}
          defaultCourseId={courseId}
          onClose={() => router.dismiss()}
          onSubmit={handleSubmit}
        />
      </View>
    </>
  );
}
