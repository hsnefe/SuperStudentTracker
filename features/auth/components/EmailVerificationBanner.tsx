import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { resendVerificationEmail } from "../api/resendVerificationEmail";
import { useAuth } from "../hooks/useAuth";
import { mapAuthError } from "../utils/mapAuthError";
import { useTheme } from "@/hooks";
import { SimpleToast } from "@/components/SimpleToast";

export function EmailVerificationBanner() {
  const { user, emailVerified, reloadUser } = useAuth();
  const { colors, spacing, typography, radius } = useTheme();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!user || emailVerified) return null;

  const handleResend = async () => {
    setBusy(true);
    try {
      await resendVerificationEmail();
      setToast("Verification email sent.");
      await reloadUser();
    } catch (error) {
      setToast(mapAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: colors.warning + "33",
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          },
        ]}
      >
        <Text style={[typography.caption, { color: colors.textPrimary, flex: 1 }]}>
          Please verify your email address. Check your inbox for a confirmation link.
        </Text>
        <Pressable
          onPress={handleResend}
          disabled={busy}
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.sm,
              opacity: pressed || busy ? 0.75 : 1,
            },
          ]}
        >
          <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: "600" }]}>
            {busy ? "Sending…" : "Resend"}
          </Text>
        </Pressable>
      </View>
      <SimpleToast
        visible={toast != null}
        message={toast ?? ""}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  action: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
