import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CourseMaterialsScreen } from "@/features/materials/screens/CourseMaterialsScreen";
import { useCourseDetailTabs } from "@/hooks";
import { useTheme } from "@/hooks";

export default function CourseMaterialsRoute() {
  const { id, title } = useCourseDetailTabs();
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="light" />
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
        <CourseMaterialsScreen courseId={id} courseTitle={title} />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
