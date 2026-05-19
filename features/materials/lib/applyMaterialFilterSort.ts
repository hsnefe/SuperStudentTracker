import type { CourseMaterial } from "@/types";
import type { MaterialFilterValue, MaterialSortValue } from "./materialOptions";

export function applyMaterialFilterSort(
  materials: CourseMaterial[],
  filter: MaterialFilterValue,
  sort: MaterialSortValue,
): CourseMaterial[] {
  let list = materials.filter((m) => m.kind !== "folder");
  if (filter !== "all") {
    list = list.filter((m) => m.kind === filter);
  }

  const sorted = [...list];
  sorted.sort((a, b) => {
    switch (sort) {
      case "date_asc":
        return a.createdAt.localeCompare(b.createdAt);
      case "name_asc":
        return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
      case "name_desc":
        return b.title.localeCompare(a.title, undefined, { sensitivity: "base" });
      case "date_desc":
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
  return sorted;
}
