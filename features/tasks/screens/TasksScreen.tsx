import { Text } from "react-native";
import { PlaceholderCard, ScreenContainer } from "../../../components";
import { useTheme } from "../../../hooks";

export function TasksScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700", marginBottom: 16 }}>
        Tasks
      </Text>
      <PlaceholderCard
        title="Assignments"
        description="Upcoming assignments, checklists, and priorities go here."
      />
    </ScreenContainer>
  );
}
