import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { signInWithEmail } from "../api/signInWithEmail";
import { sendPasswordReset } from "../api/sendPasswordReset";
import { signUpWithEmail } from "../api/signUpWithEmail";
import { mapAuthError } from "../utils/mapAuthError";
import { validatePassword } from "../utils/validatePassword";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { useTheme } from "@/hooks";
import { isFirebaseConfigured } from "@/lib/firebase";
import { PlaceholderCard } from "@/components/PlaceholderCard";

export type AuthMode = "login" | "register" | "forgot";

type Props = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onToast: (message: string) => void;
};

export function AuthForm({ mode, onModeChange, onToast }: Props) {
  const { colors, spacing, typography, radius } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!isFirebaseConfigured) {
    return (
      <PlaceholderCard
        title="Firebase not configured"
        description="Add your EXPO_PUBLIC_FIREBASE_* values to a .env file to sign in."
        hint="Copy .env.example and fill in your Firebase project keys."
      />
    );
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.primaryDark,
      borderColor: colors.border,
      borderRadius: radius.md,
      color: colors.textPrimary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
  ];

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      onToast("Please enter your email.");
      return;
    }

    if (mode === "forgot") {
      setBusy(true);
      try {
        await sendPasswordReset(trimmedEmail);
        onToast("Password reset email sent. Check your inbox.");
        onModeChange("login");
      } catch (error) {
        onToast(mapAuthError(error));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!password) {
      onToast("Please enter your password.");
      return;
    }

    if (mode === "register") {
      const passwordError = validatePassword(password);
      if (passwordError) {
        onToast(passwordError);
        return;
      }
      if (password !== confirmPassword) {
        onToast("Passwords do not match.");
        return;
      }
      if (!displayName.trim()) {
        onToast("Please enter your name.");
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmail(trimmedEmail, password);
      } else {
        await signUpWithEmail(trimmedEmail, password, displayName.trim());
        onToast("Account created. Check your email to verify your address.");
      }
    } catch (error) {
      onToast(mapAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Reset password";

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { padding: spacing.xl, gap: spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[typography.title, { color: colors.textPrimary }]}>{title}</Text>

        {mode !== "forgot" ? (
          <View style={[styles.segment, { backgroundColor: colors.surface, borderRadius: radius.pill }]}>
            {(["login", "register"] as const).map((tab) => {
              const active = mode === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => onModeChange(tab)}
                  style={[
                    styles.segmentItem,
                    active && { backgroundColor: colors.accent, borderRadius: radius.pill },
                  ]}
                >
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: colors.textPrimary,
                        fontWeight: active ? "700" : "500",
                      },
                    ]}
                  >
                    {tab === "login" ? "Login" : "Register"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          style={inputStyle}
        />

        {mode === "register" ? (
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Display name"
            placeholderTextColor={colors.textMuted}
            autoComplete="name"
            style={inputStyle}
          />
        ) : null}

        {mode !== "forgot" ? (
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            autoComplete={mode === "login" ? "password" : "new-password"}
            style={inputStyle}
          />
        ) : null}

        {mode === "register" ? (
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            autoComplete="new-password"
            style={inputStyle}
          />
        ) : null}

        {mode === "register" ? (
          <Pressable
            onPress={() => setTermsAccepted((v) => !v)}
            style={styles.termsRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: colors.border,
                  backgroundColor: termsAccepted ? colors.accent : "transparent",
                },
              ]}
            />
            <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]}>
              I agree to the Terms of Service and Privacy Policy (optional)
            </Text>
          </Pressable>
        ) : null}

        {mode === "login" ? (
          <Pressable onPress={() => onModeChange("forgot")}>
            <Text style={[typography.caption, { color: colors.highlight }]}>Forgot password?</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={busy}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.md,
              opacity: pressed || busy ? 0.85 : 1,
            },
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "700" }]}>
              {mode === "forgot"
                ? "Send reset link"
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </Text>
          )}
        </Pressable>

        {mode === "forgot" ? (
          <Pressable onPress={() => onModeChange("login")}>
            <Text style={[typography.caption, { color: colors.highlight }]}>Back to sign in</Text>
          </Pressable>
        ) : (
          <>
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[typography.caption, { color: colors.textMuted }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>
            <SocialAuthButtons onError={onToast} disabled={busy} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center" },
  segment: {
    flexDirection: "row",
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
  },
  primaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    minHeight: 48,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    marginTop: 2,
  },
});
