import type { SelectOption } from "@/constants/assignmentOptions";
import type { CourseMaterialKind } from "@/types";

export type MaterialFilterValue = "all" | CourseMaterialKind;

export type MaterialSortValue = "date_desc" | "date_asc" | "name_asc" | "name_desc";

export const MATERIAL_FILTER_OPTIONS: SelectOption<MaterialFilterValue>[] = [
  { value: "all", label: "All types" },
  { value: "pdf", label: "PDF" },
  { value: "slides", label: "Slides" },
  { value: "image", label: "Images" },
  { value: "document", label: "Documents" },
  { value: "link", label: "Links" },
  { value: "other", label: "Other" },
];

export const MATERIAL_SORT_OPTIONS: SelectOption<MaterialSortValue>[] = [
  { value: "date_desc", label: "Date (newest)" },
  { value: "date_asc", label: "Date (oldest)" },
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "name_desc", label: "Name (Z–A)" },
];

export const MATERIAL_FOLDER_LABELS: Record<CourseMaterialKind, string> = {
  pdf: "PDF",
  slides: "Slides",
  image: "Images",
  document: "Documents",
  link: "Links",
  other: "Other",
};
