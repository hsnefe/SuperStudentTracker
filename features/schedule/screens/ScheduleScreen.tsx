import { Text } from "react-native";
import { PlaceholderCard, ScreenContainer } from "../../../components";
import { useTheme } from "../../../hooks";
import { useUiStore } from "../../../store";

export function ScheduleScreen() {
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
        title="Weekly Agenda"
        description="Class blocks, study sessions, and events will be visualized here."
      />
    </ScreenContainer>
  );
}
