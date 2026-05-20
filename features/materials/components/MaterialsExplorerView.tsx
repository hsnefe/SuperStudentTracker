import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "@/hooks";
import type { CourseMaterial } from "@/types";
import { applyMaterialFilterSort } from "../lib/applyMaterialFilterSort";
import {
  countDirectChildren,
  findMaterial,
  getChildren,
  isUserFolder,
} from "../lib/folderHelpers";
import { materialKindIcon } from "../lib/materialIcons";
import type { MaterialFilterValue, MaterialSortValue } from "../lib/materialOptions";
import { MaterialListItem } from "./MaterialListItem";

type ViewMode = "folders" | "list" | "grid";

type Props = {
  courseId: string;
  materials: CourseMaterial[];
  filter: MaterialFilterValue;
  sort: MaterialSortValue;
  onDeleteMaterial?: (material: CourseMaterial) => void;
  onAddMaterial?: (parentFolderId: string) => void;
  onCurrentFolderChange?: (folderId: string | null) => void;
};

function FolderCard({
  folder,
  childCount,
  onPress,
  onLongPress,
  gridColumns,
}: {
  folder: CourseMaterial;
  childCount: number;
  onPress: () => void;
  onLongPress?: () => void;
  gridColumns: number;
}) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.folderCard,
        {
          flex: gridColumns > 1 ? 1 : undefined,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.md,
          padding: spacing.md,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${folder.title}, ${childCount} items`}
    >
      <MaterialIcons name={materialKindIcon("folder")} size={28} color="#FFC85C" />
      <Text
        style={[typography.body, { color: colors.textPrimary, fontWeight: "600", marginTop: spacing.sm }]}
        numberOfLines={2}
      >
        {folder.title}
      </Text>
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
        {childCount} {childCount === 1 ? "item" : "items"}
      </Text>
    </Pressable>
  );
}

export function MaterialsExplorerView({
  courseId,
  materials,
  filter,
  sort,
  onDeleteMaterial,
  onAddMaterial,
  onCurrentFolderChange,
}: Props) {
  const { colors, typography, spacing, radius } = useTheme();
  const { width } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>("folders");
  const [folderPath, setFolderPath] = useState<string[]>([]);

  const currentFolderId = folderPath.length > 0 ? folderPath[folderPath.length - 1] : null;
  const insideFolder = currentFolderId != null;

  useEffect(() => {
    onCurrentFolderChange?.(currentFolderId);
  }, [currentFolderId, onCurrentFolderChange]);

  const gridColumns = width >= 600 ? 3 : 2;
  const folderCardWidth =
    (width - spacing.lg * 2 - spacing.sm * (gridColumns - 1)) / gridColumns;

  const breadcrumbTitles = useMemo(() => {
    return folderPath
      .map((id) => findMaterial(materials, id)?.title)
      .filter((t): t is string => Boolean(t));
  }, [folderPath, materials]);

  const breadcrumb =
    breadcrumbTitles.length > 0
      ? `Materials › ${breadcrumbTitles.join(" › ")}`
      : "Materials";

  const rootFolders = useMemo(
    () =>
      getChildren(materials, null)
        .filter(isUserFolder)
        .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" })),
    [materials],
  );

  const unassignedFiles = useMemo(
    () =>
      getChildren(materials, null)
        .filter((m) => !isUserFolder(m))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [materials],
  );

  const childFolders = useMemo(() => {
    if (!currentFolderId) return [];
    return getChildren(materials, currentFolderId)
      .filter(isUserFolder)
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  }, [materials, currentFolderId]);

  const folderFiles = useMemo(() => {
    if (!currentFolderId) return [];
    const files = getChildren(materials, currentFolderId).filter((m) => !isUserFolder(m));
    return applyMaterialFilterSort(files, filter, sort);
  }, [materials, currentFolderId, filter, sort]);

  const goBack = () => {
    setFolderPath((p) => {
      const next = p.slice(0, -1);
      if (next.length === 0) setViewMode("folders");
      return next;
    });
  };

  const openFolder = (folderId: string) => {
    setFolderPath((p) => [...p, folderId]);
    setViewMode("list");
  };

  const toggleView = () => {
    if (insideFolder) {
      setViewMode((m) => (m === "grid" ? "list" : "grid"));
      return;
    }
    setViewMode((m) => {
      if (m === "folders") return "list";
      if (m === "list") return "grid";
      return "folders";
    });
  };

  const viewToggleIcon = insideFolder
    ? viewMode === "grid"
      ? "view-list"
      : "grid-view"
    : viewMode === "folders"
      ? "view-list"
      : viewMode === "list"
        ? "grid-view"
        : "folder";

  const showRootFolderGrid = !insideFolder && viewMode === "folders";
  const showRootFlatList = !insideFolder && viewMode !== "folders";

  const insideListColumns = viewMode === "grid" ? gridColumns : 1;

  const renderFileList = (
    files: CourseMaterial[],
    emptyMessage: string,
    showAddCta?: boolean,
  ) => (
    <FlatList
      key={`folder-contents-${currentFolderId}-${viewMode}`}
      data={files}
      keyExtractor={(m) => m.id}
      numColumns={insideListColumns}
      columnWrapperStyle={
        insideListColumns > 1 ? { gap: spacing.sm } : undefined
      }
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
      }}
      ListHeaderComponent={
        insideFolder && childFolders.length > 0 ? (
          <View style={{ marginBottom: spacing.md }}>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, marginBottom: spacing.sm, fontWeight: "600" },
              ]}
            >
              FOLDERS
            </Text>
            <View style={{ gap: spacing.sm }}>
              {childFolders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  childCount={countDirectChildren(materials, folder.id)}
                  onPress={() => openFolder(folder.id)}
                  onLongPress={onDeleteMaterial ? () => onDeleteMaterial(folder) : undefined}
                  gridColumns={1}
                />
              ))}
            </View>
            {files.length > 0 ? (
              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.textSecondary,
                    marginTop: spacing.md,
                    marginBottom: spacing.sm,
                    fontWeight: "600",
                  },
                ]}
              >
                FILES
              </Text>
            ) : null}
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={insideFolder && viewMode === "grid" ? { flex: 1 } : undefined}>
          <MaterialListItem
            courseId={courseId}
            material={item}
            compact={insideFolder && viewMode === "grid"}
            onLongPress={onDeleteMaterial ? () => onDeleteMaterial(item) : undefined}
          />
        </View>
      )}
      ListEmptyComponent={
        childFolders.length > 0 ? null : (
        <View style={{ paddingVertical: spacing.lg, gap: spacing.md, alignItems: "flex-start" }}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>{emptyMessage}</Text>
          {showAddCta && onAddMaterial && currentFolderId ? (
            <Pressable
              onPress={() => onAddMaterial(currentFolderId)}
              style={[
                styles.addCta,
                {
                  backgroundColor: colors.accent,
                  borderRadius: radius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Add material to folder"
            >
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={[typography.caption, { color: "#fff", fontWeight: "700" }]}>
                Add material
              </Text>
            </Pressable>
          ) : null}
        </View>
        )
      }
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <View
        style={[styles.explorerHeader, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}
      >
        <View style={styles.breadcrumbRow}>
          {insideFolder ? (
            <Pressable
              onPress={goBack}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={styles.backBtn}
            >
              <MaterialIcons name="arrow-back" size={20} color="#FFC85C" />
            </Pressable>
          ) : null}
          <Text
            style={[typography.caption, { color: colors.textSecondary, flex: 1 }]}
            numberOfLines={2}
          >
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

      {insideFolder ? (
        renderFileList(
          folderFiles,
          "This folder is empty.",
          childFolders.length === 0 && folderFiles.length === 0,
        )
      ) : showRootFolderGrid ? (
        <SectionList
          key="root-sections"
          sections={[
            ...(rootFolders.length > 0
              ? [
                  {
                    key: "folders" as const,
                    title: "FOLDERS",
                    data: ["grid"] as const,
                  },
                ]
              : []),
            ...(unassignedFiles.length > 0
              ? [
                  {
                    key: "unassigned" as const,
                    title: "UNASSIGNED",
                    data: unassignedFiles,
                  },
                ]
              : []),
          ]}
          keyExtractor={(item, index) =>
            typeof item === "string" ? item : (item as CourseMaterial).id ?? String(index)
          }
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
          renderSectionHeader={({ section }) =>
            section.title ? (
              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.textSecondary,
                    paddingHorizontal: spacing.lg,
                    marginTop: section.key === "unassigned" ? spacing.md : 0,
                    marginBottom: spacing.sm,
                    fontWeight: "600",
                  },
                ]}
              >
                {section.title}
              </Text>
            ) : null
          }
          renderItem={({ item, section }) => {
            if (section.key === "folders") {
              return (
                <View
                  style={[
                    styles.folderGrid,
                    {
                      paddingHorizontal: spacing.lg,
                      gap: spacing.sm,
                      marginBottom: spacing.sm,
                    },
                  ]}
                >
                  {rootFolders.map((folder) => (
                    <View
                      key={folder.id}
                      style={{
                        width: gridColumns > 1 ? folderCardWidth : undefined,
                        flex: gridColumns > 1 ? undefined : 1,
                      }}
                    >
                      <FolderCard
                        folder={folder}
                        childCount={countDirectChildren(materials, folder.id)}
                        onPress={() => openFolder(folder.id)}
                        onLongPress={
                          onDeleteMaterial ? () => onDeleteMaterial(folder) : undefined
                        }
                        gridColumns={gridColumns}
                      />
                    </View>
                  ))}
                </View>
              );
            }
            return (
              <View style={{ paddingHorizontal: spacing.lg }}>
                <MaterialListItem
                  courseId={courseId}
                  material={item}
                  onLongPress={onDeleteMaterial ? () => onDeleteMaterial(item) : undefined}
                />
              </View>
            );
          }}
          ListEmptyComponent={
            rootFolders.length === 0 && unassignedFiles.length === 0 ? (
              <Text
                style={[
                  typography.body,
                  { color: colors.textSecondary, paddingHorizontal: spacing.lg },
                ]}
              >
                No folders or materials yet.
              </Text>
            ) : null
          }
        />
      ) : showRootFlatList ? (
        <FlatList
          key={`root-flat-${viewMode}`}
          data={[...rootFolders, ...unassignedFiles]}
          keyExtractor={(m) => m.id}
          numColumns={1}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xxl,
            gap: spacing.sm,
          }}
          renderItem={({ item }) =>
            isUserFolder(item) ? (
              <FolderCard
                folder={item}
                childCount={countDirectChildren(materials, item.id)}
                onPress={() => openFolder(item.id)}
                onLongPress={onDeleteMaterial ? () => onDeleteMaterial(item) : undefined}
                gridColumns={1}
              />
            ) : (
              <MaterialListItem
                courseId={courseId}
                material={item}
                onLongPress={onDeleteMaterial ? () => onDeleteMaterial(item) : undefined}
              />
            )
          }
        />
      ) : null}
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
    minHeight: 88,
  },
  folderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  addCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
