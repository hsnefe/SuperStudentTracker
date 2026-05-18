import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { signInWithGoogleIdToken } from "../api/signInWithGoogleCredential";
import { signInWithAppleCredential } from "../api/signInWithAppleCredential";
import { mapAuthError } from "../utils/mapAuthError";
import { useTheme } from "@/hooks";

WebBrowser.maybeCompleteAuthSession();

type Props = {
  onError: (message: string) => void;
  disabled?: boolean;
};

/** iOS / Android — expo-auth-session Google + Sign in with Apple (iOS only). */
export function SocialAuthButtons({ onError, disabled }: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const [busy, setBusy] = useState<"google" | "apple" | null>(null);

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  const [googleRequest, googleResponse, promptGoogle] = Google.useAuthRequest({
    webClientId: webClientId || undefined,
    iosClientId: iosClientId || webClientId || undefined,
    androidClientId: androidClientId || webClientId || undefined,
  });

  useEffect(() => {
    if (!googleResponse) return;

    if (googleResponse.type === "cancel" || googleResponse.type === "dismiss") {
      setBusy(null);
      return;
    }

    if (googleResponse.type !== "success") return;

    const idToken = googleResponse.authentication?.idToken;
    if (!idToken) {
      onError("Google sign-in did not return a token.");
      setBusy(null);
      return;
    }

    signInWithGoogleIdToken(idToken)
      .catch((error) => onError(mapAuthError(error)))
      .finally(() => setBusy(null));
  }, [googleResponse, onError]);

  const handleGoogle = async () => {
    if (disabled || busy) return;

    if (!googleRequest) {
      onError("Google Sign-In is not configured. Add EXPO_PUBLIC_GOOGLE_* to .env");
      return;
    }

    setBusy("google");
    try {
      await promptGoogle();
    } catch (error) {
      onError(mapAuthError(error));
      setBusy(null);
    }
  };

  const handleApple = async () => {
    if (disabled || busy || Platform.OS !== "ios") return;

    setBusy("apple");
    try {
      const result = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!result.identityToken) {
        onError("Apple sign-in did not return a token.");
        return;
      }

      await signInWithAppleCredential(result.identityToken);
    } catch (error: unknown) {
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code: string }).code)
          : "";
      if (code === "ERR_REQUEST_CANCELED") return;
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

      {Platform.OS === "ios" ? (
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
      ) : null}
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
