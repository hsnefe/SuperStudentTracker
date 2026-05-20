import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { MaterialPdfScreen } from "@/features/materials/screens/MaterialPdfScreen";
import { useCourseMaterials } from "@/features/materials/hooks/useCourseMaterials";
import { useTheme } from "@/hooks";

export default function MaterialPdfRoute() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id: string | string[]; materialId: string | string[] }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id ?? "";
  const materialId = Array.isArray(params.materialId)
    ? params.materialId[0]
    : params.materialId ?? "";

  const { data: materials = [], isLoading } = useCourseMaterials(courseId);
  const material = materials.find((m) => m.id === materialId);

  useEffect(() => {
    void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    return () => {
      void ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !material) {
      router.back();
    }
  }, [isLoading, material, router]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {isLoading || !material ? (
        <View style={[styles.loading, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <MaterialPdfScreen material={material} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
