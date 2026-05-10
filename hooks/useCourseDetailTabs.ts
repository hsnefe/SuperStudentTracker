import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import type { CourseDetailSection } from "@/components/course/CourseDetailAppBar";

export function useCourseDetailTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams<{ id: string | string[]; title?: string | string[] }>();

  const idRaw = params.id;
  const titleRaw = params.title;
  const id = Array.isArray(idRaw) ? idRaw[0] : idRaw ?? "";
  const titleParam = Array.isArray(titleRaw) ? titleRaw[0] : titleRaw;
  const title =
    typeof titleParam === "string" && titleParam.length > 0 ? titleParam : "Course";

  const query = title.length > 0 ? `?title=${encodeURIComponent(title)}` : "";
  const base = `/course/${encodeURIComponent(id)}`;

  const activeSection = useMemo((): CourseDetailSection => {
    const parts = pathname.split("/").filter(Boolean);
    const courseIdx = parts.indexOf("course");
    if (courseIdx < 0 || courseIdx + 2 >= parts.length) return "home";
    const segment = parts[courseIdx + 2];
    if (segment === "materials") return "materials";
    if (segment === "grades") return "grades";
    return "home";
  }, [pathname]);

  const onSelectSection = useCallback(
    (section: CourseDetailSection) => {
      if (section === "home") router.replace(`${base}${query}`);
      else if (section === "materials") router.replace(`${base}/materials${query}`);
      else router.replace(`${base}/grades${query}`);
    },
    [base, query, router],
  );

  return { id, title, activeSection, onSelectSection };
}
