import { Text } from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { PlaceholderCard } from "../../../shared/components/PlaceholderCard";
import { useTheme } from "../../../core/theme/useTheme";

export function ScheduleScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700", marginBottom: 16 }}>
        Schedule
      </Text>
      <PlaceholderCard
        title="Weekly Agenda"
        description="Class blocks, study sessions, and events will be visualized here."
      />
    </ScreenContainer>
  );
}
