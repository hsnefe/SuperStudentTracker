import * as Haptics from "expo-haptics";
import { type Href, useRouter } from "expo-router";
import { useCallback, type RefObject } from "react";
import { View } from "react-native";
import { useNavigationTransitionStore } from "@/store/navigationTransitionStore";

export function useExpandNavigation() {
  const router = useRouter();
  const setOrigin = useNavigationTransitionStore((s) => s.setOrigin);

  const navigateExpand = useCallback(
    (href: Href, sourceRef: RefObject<View | null>, mode: "push" | "replace") => {
      const node = sourceRef.current;
      const go = () => (mode === "push" ? router.push(href) : router.replace(href));

      if (!node) {
        go();
        return;
      }

      node.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setOrigin({ x, y, width, height });
        }
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        go();
      });
    },
    [router, setOrigin],
  );

  const pushExpand = useCallback(
    (href: Href, sourceRef: RefObject<View | null>) => {
      navigateExpand(href, sourceRef, "push");
    },
    [navigateExpand],
  );

  const replaceExpand = useCallback(
    (href: Href, sourceRef: RefObject<View | null>) => {
      navigateExpand(href, sourceRef, "replace");
    },
    [navigateExpand],
  );

  return { pushExpand, replaceExpand };
}
