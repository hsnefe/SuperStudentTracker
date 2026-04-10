import { Text } from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { PlaceholderCard } from "../../../shared/components/PlaceholderCard";
import { useTheme } from "../../../core/theme/useTheme";

export function CoursesScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700", marginBottom: 16 }}>
        Courses
      </Text>
      <PlaceholderCard
        title="Course List"
        description="Track current classes, instructors, and grade targets."
      />
    </ScreenContainer>
  );
}
