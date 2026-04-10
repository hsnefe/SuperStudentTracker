import { Text } from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { PlaceholderCard } from "../../../shared/components/PlaceholderCard";
import { useTheme } from "../../../core/theme/useTheme";

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
