import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { signInWithGoogleWeb } from "../api/signInWithGoogleWeb";
import { signInWithAppleWeb } from "../api/signInWithAppleWeb";
import { mapAuthError } from "../utils/mapAuthError";
import { useTheme } from "@/hooks";

type Props = {
  onError: (message: string) => void;
  disabled?: boolean;
};

/** Web uses Firebase signInWithPopup — no expo-auth-session Google hook. */
export function SocialAuthButtons({ onError, disabled }: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);

  const handleGoogle = async () => {
    if (disabled || busy) return;
    setBusy("google");
    try {
      await signInWithGoogleWeb();
    } catch (error) {
      onError(mapAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  const handleApple = async () => {
    if (disabled || busy) return;
    setBusy("apple");
    try {
      await signInWithAppleWeb();
    } catch (error) {
      onError(mapAuthError(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={[styles.row, { gap: spacing.md }]}>
      <Pressable
        onPress={handleGoogle}
        disabled={disabled || busy != null}
        style={({ pressed }) => [
          styles.socialBtn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            opacity: pressed || disabled ? 0.8 : 1,
          },
        ]}
      >
        {busy === "google" ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color={colors.textPrimary} />
            <Text style={[typography.caption, { color: colors.textPrimary }]}>Google</Text>
          </>
        )}
      </Pressable>

      <Pressable
        onPress={handleApple}
        disabled={disabled || busy != null}
        style={({ pressed }) => [
          styles.socialBtn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            opacity: pressed || disabled ? 0.8 : 1,
          },
        ]}
      >
        {busy === "apple" ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <>
            <Ionicons name="logo-apple" size={20} color={colors.textPrimary} />
            <Text style={[typography.caption, { color: colors.textPrimary }]}>Apple</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
