import type { CourseMaterial } from "@/types";

export function isUserFolder(m: CourseMaterial): boolean {
  return m.kind === "folder";
}

/** Direct children (subfolders + files) of a folder id, or root when parentId is null. */
export function getChildren(
  materials: CourseMaterial[],
  parentId: string | null,
): CourseMaterial[] {
  return materials.filter((m) => (m.parentFolderId ?? null) === parentId);
}

export function countDirectChildren(materials: CourseMaterial[], folderId: string): number {
  return getChildren(materials, folderId).length;
}

/** All descendant material ids including the folder itself. */
export function collectDescendantIds(
  materials: CourseMaterial[],
  folderId: string,
): Set<string> {
  const ids = new Set<string>([folderId]);
  const queue = [folderId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const m of materials) {
      if ((m.parentFolderId ?? null) === current && !ids.has(m.id)) {
        ids.add(m.id);
        if (isUserFolder(m)) queue.push(m.id);
      }
    }
  }
  return ids;
}

export function findMaterial(
  materials: CourseMaterial[],
  id: string,
): CourseMaterial | undefined {
  return materials.find((m) => m.id === id);
}

export function validateParentFolder(
  materials: CourseMaterial[],
  parentFolderId: string | null | undefined,
): void {
  if (parentFolderId == null || parentFolderId === "") return;
  const parent = findMaterial(materials, parentFolderId);
  if (!parent || !isUserFolder(parent)) {
    throw new Error("Parent folder not found");
  }
}

export type FolderPickerOption = {
  id: string | null;
  label: string;
  depth: number;
};

/** Flatten folder tree for parent picker (null id = unassigned / root). */
export function buildFolderPickerOptions(
  materials: CourseMaterial[],
): FolderPickerOption[] {
  const folders = materials.filter(isUserFolder);
  const byParent = new Map<string | null, CourseMaterial[]>();
  for (const f of folders) {
    const key = f.parentFolderId ?? null;
    const list = byParent.get(key) ?? [];
    list.push(f);
    byParent.set(key, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
  }

  const options: FolderPickerOption[] = [{ id: null, label: "Unassigned (root)", depth: 0 }];

  const walk = (parentId: string | null, depth: number) => {
    const children = byParent.get(parentId) ?? [];
    for (const f of children) {
      options.push({ id: f.id, label: f.title, depth });
      walk(f.id, depth + 1);
    }
  };
  walk(null, 0);
  return options;
}
