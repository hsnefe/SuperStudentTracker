import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { UploadMaterialModal } from "@/features/materials/components/UploadMaterialModal";
import { useUploadMaterial } from "@/features/materials/hooks/useUploadMaterial";
import type { CreateMaterialInput } from "@/types";

export default function AddCourseMaterialScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const idRaw = params.id;
  const courseId = Array.isArray(idRaw) ? idRaw[0] : idRaw ?? "";
  const uploadMaterial = useUploadMaterial(courseId);

  const handleSubmit = async (input: CreateMaterialInput) => {
    try {
      await uploadMaterial.mutateAsync(input);
      router.dismiss();
    } catch {
      router.dismiss();
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal" }} />
      <View style={{ flex: 1 }}>
        <UploadMaterialModal
          visible
          busy={uploadMaterial.isPending}
          courseId={courseId}
          onClose={() => router.dismiss()}
          onSubmit={handleSubmit}
        />
      </View>
    </>
  );
}
