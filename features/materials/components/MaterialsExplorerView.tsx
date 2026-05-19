import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "@/hooks";
import type { CourseMaterial, CourseMaterialKind } from "@/types";
import { applyMaterialFilterSort } from "../lib/applyMaterialFilterSort";
import { materialKindIcon } from "../lib/materialIcons";
import {
  MATERIAL_FOLDER_LABELS,
  type MaterialFilterValue,
  type MaterialSortValue,
} from "../lib/materialOptions";
import { MaterialListItem } from "./MaterialListItem";

type ViewMode = "folders" | "list" | "grid";

type Props = {
  materials: CourseMaterial[];
  filter: MaterialFilterValue;
  sort: MaterialSortValue;
  onDeleteMaterial?: (material: CourseMaterial) => void;
};

const FOLDER_KINDS: CourseMaterialKind[] = [
  "pdf",
  "slides",
  "image",
  "document",
  "link",
  "other",
];

export function MaterialsExplorerView({
  materials,
  filter,
  sort,
  onDeleteMaterial,
}: Props) {
  const { colors, typography, spacing, radius } = useTheme();
  const { width } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>("folders");
  const [openFolder, setOpenFolder] = useState<CourseMaterialKind | null>(null);

  const filteredSorted = useMemo(
    () => applyMaterialFilterSort(materials, filter, sort),
    [materials, filter, sort],
  );

  const folderCounts = useMemo(() => {
    const counts = new Map<CourseMaterialKind, number>();
    for (const kind of FOLDER_KINDS) counts.set(kind, 0);
    for (const m of filteredSorted) {
      counts.set(m.kind, (counts.get(m.kind) ?? 0) + 1);
    }
    return counts;
  }, [filteredSorted]);

  const folderMaterials = useMemo(() => {
    if (!openFolder) return filteredSorted;
    return filteredSorted.filter((m) => m.kind === openFolder);
  }, [filteredSorted, openFolder]);

  const gridColumns = width >= 600 ? 3 : 2;

  const breadcrumb =
    openFolder != null
      ? `Materials › ${MATERIAL_FOLDER_LABELS[openFolder]}`
      : "Materials";

  const toggleView = () => {
    if (openFolder != null) {
      setViewMode((m) => (m === "grid" ? "list" : "grid"));
      return;
    }
    setViewMode((m) => {
      if (m === "folders") return "list";
      if (m === "list") return "grid";
      return "folders";
    });
  };

  const viewToggleIcon =
    openFolder != null
      ? viewMode === "grid"
        ? "view-list"
        : "grid-view"
      : viewMode === "folders"
        ? "view-list"
        : viewMode === "list"
          ? "grid-view"
          : "folder";

  const showFolders = viewMode === "folders" && openFolder == null;

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.explorerHeader, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
        <View style={styles.breadcrumbRow}>
          {openFolder != null ? (
            <Pressable
              onPress={() => setOpenFolder(null)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Back to folders"
              style={styles.backBtn}
            >
              <MaterialIcons name="arrow-back" size={20} color="#FFC85C" />
            </Pressable>
          ) : null}
          <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
            {breadcrumb}
          </Text>
          <Pressable
            onPress={toggleView}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Toggle view"
            style={styles.viewToggle}
          >
            <MaterialIcons name={viewToggleIcon} size={22} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </View>
      </View>

      {showFolders ? (
        <FlatList
          data={FOLDER_KINDS.filter((k) => (folderCounts.get(k) ?? 0) > 0)}
          keyExtractor={(k) => k}
          numColumns={gridColumns}
          columnWrapperStyle={gridColumns > 1 ? { gap: spacing.sm } : undefined}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xxl,
            gap: spacing.sm,
          }}
          renderItem={({ item: kind }) => {
            const count = folderCounts.get(kind) ?? 0;
            return (
              <Pressable
                onPress={() => {
                  setOpenFolder(kind);
                  setViewMode("list");
                }}
                style={[
                  styles.folderCard,
                  {
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing.md,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${MATERIAL_FOLDER_LABELS[kind]}, ${count} files`}
              >
                <MaterialIcons name={materialKindIcon(kind)} size={28} color="#FFC85C" />
                <Text
                  style={[typography.body, { color: colors.textPrimary, fontWeight: "600", marginTop: spacing.sm }]}
                  numberOfLines={1}
                >
                  {MATERIAL_FOLDER_LABELS[kind]}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                  {count} {count === 1 ? "file" : "files"}
                </Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textSecondary, paddingHorizontal: spacing.lg }]}>
              No materials match this filter.
            </Text>
          }
        />
      ) : (
        <FlatList
          data={folderMaterials}
          keyExtractor={(m) => m.id}
          numColumns={viewMode === "grid" && openFolder != null ? gridColumns : 1}
          columnWrapperStyle={
            viewMode === "grid" && openFolder != null && gridColumns > 1
              ? { gap: spacing.sm }
              : undefined
          }
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xxl,
          }}
          renderItem={({ item }) => (
            <View style={viewMode === "grid" && openFolder != null ? { flex: 1 } : undefined}>
              <MaterialListItem
                material={item}
                compact={viewMode === "grid"}
                onLongPress={
                  onDeleteMaterial ? () => onDeleteMaterial(item) : undefined
                }
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              This folder is empty.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  explorerHeader: {},
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    padding: 2,
  },
  viewToggle: {
    padding: 4,
  },
  folderCard: {
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 100,
  },
});
