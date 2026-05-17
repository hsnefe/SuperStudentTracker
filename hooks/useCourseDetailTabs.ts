import type { Href } from "expo-router";
import { useLocalSearchParams, usePathname } from "expo-router";
import { useCallback, useMemo, type RefObject } from "react";
import { View } from "react-native";
import type { CourseDetailSection } from "@/components/course/CourseDetailAppBar";
import { useExpandNavigation } from "./useExpandNavigation";

export function useCourseDetailTabs() {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ id: string | string[]; title?: string | string[] }>();

  const idRaw = params.id;
  const titleRaw = params.title;
  const id = Array.isArray(idRaw) ? idRaw[0] : idRaw ?? "";
  const titleParam = Array.isArray(titleRaw) ? titleRaw[0] : titleRaw;
  const title =
    typeof titleParam === "string" && titleParam.length > 0 ? titleParam : "Course";

  const activeSection = useMemo((): CourseDetailSection => {
    const parts = pathname.split("/").filter(Boolean);
    const courseIdx = parts.indexOf("course");
    if (courseIdx < 0 || courseIdx + 2 >= parts.length) return "home";
    const segment = parts[courseIdx + 2];
    if (segment === "materials") return "materials";
    if (segment === "grades") return "grades";
    return "home";
  }, [pathname]);

  const { replaceExpand } = useExpandNavigation();

  const sectionHref = useCallback(
    (section: CourseDetailSection): Href => {
      if (section === "home") {
        return { pathname: "/course/[id]", params: { id, title } };
      }
      if (section === "materials") {
        return { pathname: "/course/[id]/materials", params: { id, title } };
      }
      return { pathname: "/course/[id]/grades", params: { id, title } };
    },
    [id, title],
  );

  const onSelectSection = useCallback(
    (section: CourseDetailSection, sourceRef?: RefObject<View | null>) => {
      replaceExpand(sectionHref(section), sourceRef ?? { current: null });
    },
    [replaceExpand, sectionHref],
  );

  return { id, title, activeSection, onSelectSection, sectionHref };
}
