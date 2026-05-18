import { Slot } from "expo-router";
import { ExpandTransitionScreen } from "@/components/navigation/ExpandTransitionScreen";

export default function CourseIdLayout() {
  return (
    <ExpandTransitionScreen>
      <Slot />
    </ExpandTransitionScreen>
  );
}
