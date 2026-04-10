import { Text } from "react-native";
import { PlaceholderCard, ScreenContainer } from "../../../components";
import { useTheme } from "../../../hooks";

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
