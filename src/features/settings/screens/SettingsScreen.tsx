import { Pressable, Text } from "react-native";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { PlaceholderCard } from "../../../shared/components/PlaceholderCard";
import { useTheme } from "../../../core/theme/useTheme";

export function SettingsScreen() {
  const { colors, mode, toggleTheme } = useTheme();

  return (
    <ScreenContainer>
      <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: "700", marginBottom: 16 }}>
        Settings
      </Text>
      <PlaceholderCard
        title="Appearance"
        description="Minimal Notion-like style with light/dark mode support."
        rightSlot={
          <Pressable
            onPress={toggleTheme}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
              {mode === "light" ? "Dark" : "Light"}
            </Text>
          </Pressable>
        }
      />
    </ScreenContainer>
  );
}
