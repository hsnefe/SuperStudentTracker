import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { CourseDetailAppBar } from "@/components/course/CourseDetailAppBar";
import { useCourseDetailTabs, useTheme } from "@/hooks";
import { MaterialsExplorerView } from "../components/MaterialsExplorerView";
import { MaterialsOptionSheet } from "../components/MaterialsOptionSheet";
import { MaterialsToolbar } from "../components/MaterialsToolbar";
import { useCourseMaterials } from "../hooks/useCourseMaterials";
import { useDeleteMaterial } from "../hooks/useDeleteMaterial";
import {
  MATERIAL_FILTER_OPTIONS,
  MATERIAL_SORT_OPTIONS,
  type MaterialFilterValue,
  type MaterialSortValue,
} from "../lib/materialOptions";
import type { CourseMaterial } from "@/types";

type Props = {
  courseId: string;
  courseTitle: string;
};

export function CourseMaterialsScreen({ courseId, courseTitle }: Props) {
  const router = useRouter();
  const { activeSection, onSelectSection } = useCourseDetailTabs();
  const { colors, typography, spacing } = useTheme();

  const { data: materials = [], isLoading, isError } = useCourseMaterials(courseId);
  const deleteMaterial = useDeleteMaterial(courseId);

  const [filter, setFilter] = useState<MaterialFilterValue>("all");
  const [sort, setSort] = useState<MaterialSortValue>("date_desc");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  const filterActive = filter !== "all";
  const sortActive = sort !== "date_desc";

  const handleAdd = useCallback(() => {
    router.push({
      pathname: "/course/[id]/material/add",
      params: { id: courseId, title: courseTitle },
    });
  }, [courseId, courseTitle, router]);

  const confirmDelete = (material: CourseMaterial) => {
    Alert.alert("Delete material", `Remove "${material.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMaterial.mutate(material.id);
        },
      },
    ]);
  };

  const empty = !isLoading && materials.length === 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <CourseDetailAppBar activeSection={activeSection} onSelectSection={onSelectSection} />
      <MaterialsToolbar
        onFilterPress={() => setFilterSheetOpen(true)}
        onSortPress={() => setSortSheetOpen(true)}
        onAddPress={handleAdd}
        filterActive={filterActive}
        sortActive={sortActive}
      />
      {empty ? (
        <Text
          style={[
            typography.body,
            {
              color: colors.textSecondary,
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.md,
            },
          ]}
        >
          No materials yet. Tap + to add one.
        </Text>
      ) : null}
      {isLoading ? (
        <ActivityIndicator color="#FFC85C" style={{ paddingVertical: spacing.xl }} />
      ) : isError ? (
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
          ]}
        >
          Could not load materials.
        </Text>
      ) : empty ? null : (
        <MaterialsExplorerView
          materials={materials}
          filter={filter}
          sort={sort}
          onDeleteMaterial={confirmDelete}
        />
      )}

      <MaterialsOptionSheet
        visible={filterSheetOpen}
        title="Filter by type"
        value={filter}
        options={MATERIAL_FILTER_OPTIONS}
        onChange={setFilter}
        onClose={() => setFilterSheetOpen(false)}
      />
      <MaterialsOptionSheet
        visible={sortSheetOpen}
        title="Sort"
        value={sort}
        options={MATERIAL_SORT_OPTIONS}
        onChange={setSort}
        onClose={() => setSortSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
