import { Text } from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { PlaceholderCard } from "../../../shared/components/PlaceholderCard";
import { useTheme } from "../../../core/theme/useTheme";
import { useUiStore } from "../../../store/uiStore";

export function HomeScreen() {
  const { colors } = useTheme();
  const selectedDate = useUiStore((state) => state.selectedDate);

  return (
    <ScreenContainer>
      <Text style={{ color: colors.textPrimary, fontSize: 28, fontWeight: "700", marginBottom: 16 }}>
        Planner
      </Text>
      <PlaceholderCard
        title="Today"
        description={`Focus date: ${selectedDate}. This is your quick daily snapshot.`}
      />
      <PlaceholderCard
        title="Upcoming"
        description="Deadlines, classes, and reminders will surface here."
      />
    </ScreenContainer>
  );
}
