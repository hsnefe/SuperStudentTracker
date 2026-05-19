import type { ComponentProps } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { CourseMaterialKind } from "@/types";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

const KIND_ICONS: Record<CourseMaterialKind, IconName> = {
  pdf: "picture-as-pdf",
  slides: "slideshow",
  link: "link",
  image: "image",
  document: "description",
  other: "insert-drive-file",
};

export function materialKindIcon(kind: CourseMaterialKind): IconName {
  return KIND_ICONS[kind] ?? "insert-drive-file";
}
