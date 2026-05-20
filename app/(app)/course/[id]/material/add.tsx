import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Alert, View } from "react-native";
import { UploadMaterialModal } from "@/features/materials/components/UploadMaterialModal";
import { useCourseMaterials } from "@/features/materials/hooks/useCourseMaterials";
import { useUploadMaterial } from "@/features/materials/hooks/useUploadMaterial";
import type { CreateMaterialInput } from "@/types";

export default function AddCourseMaterialScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string | string[];
    parentFolderId?: string | string[];
  }>();
  const idRaw = params.id;
  const courseId = Array.isArray(idRaw) ? idRaw[0] : idRaw ?? "";
  const parentRaw = params.parentFolderId;
  const defaultParentFolderId = Array.isArray(parentRaw) ? parentRaw[0] : parentRaw;

  const { data: materials = [] } = useCourseMaterials(courseId);
  const uploadMaterial = useUploadMaterial(courseId);

  const handleSubmit = async (input: CreateMaterialInput) => {
    try {
      await uploadMaterial.mutateAsync(input);
      router.dismiss();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save material.";
      Alert.alert("Save failed", message);
    } finally {
      uploadMaterial.reset();
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
          materials={materials}
          defaultParentFolderId={defaultParentFolderId ?? null}
          onClose={() => router.dismiss()}
          onSubmit={handleSubmit}
        />
      </View>
    </>
  );
}
