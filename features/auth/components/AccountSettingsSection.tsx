import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { changePassword } from "../api/changePassword";
import { deleteAccountWithPassword } from "../api/deleteAccount";
import { resendVerificationEmail } from "../api/resendVerificationEmail";
import { useAuth } from "../hooks/useAuth";
import { mapAuthError } from "../utils/mapAuthError";
import { validatePassword } from "../utils/validatePassword";
import { useTheme } from "@/hooks";
import { SimpleToast } from "@/components/SimpleToast";

function providerLabel(providerIds: string[]): string {
  if (providerIds.includes("google.com")) return "Google";
  if (providerIds.includes("apple.com")) return "Apple";
  if (providerIds.includes("password")) return "Email & password";
  return providerIds.join(", ") || "Unknown";
}

export function AccountSettingsSection() {
  const { user, emailVerified, signOut, reloadUser } = useAuth();
  const { colors, spacing, typography, radius } = useTheme();
  const [toast, setToast] = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const hasPasswordProvider = user.providerData.some((p) => p.providerId === "password");
  const providers = providerLabel(user.providerData.map((p) => p.providerId));

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

  const handleResendVerification = async () => {
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

  const handleChangePassword = async () => {
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setToast(validationError);
      return;
    }

    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      setToast("Password updated.");
      setPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setToast(mapAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!hasPasswordProvider) {
      setToast("Re-authenticate with your provider in a future update.");
      return;
    }

    setBusy(true);
    try {
      await deleteAccountWithPassword(currentPassword);
      setDeleteModal(false);
      await signOut();
    } catch (error) {
      setToast(mapAuthError(error));
    } finally {
      setBusy(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert("Sign out", "You will be returned to the sign-in screen.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete account",
      "This permanently deletes your account and data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => setDeleteModal(true),
        },
      ],
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: spacing.lg,
          gap: spacing.md,
        },
      ]}
    >
      <Text style={[typography.heading, { color: colors.textPrimary }]}>Account</Text>

      <View>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Name</Text>
        <Text style={[typography.body, { color: colors.textPrimary }]}>
          {user.displayName || "—"}
        </Text>
      </View>

      <View>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Email</Text>
        <Text style={[typography.body, { color: colors.textPrimary }]}>{user.email}</Text>
      </View>

      <View>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Sign-in method</Text>
        <Text style={[typography.body, { color: colors.textPrimary }]}>{providers}</Text>
      </View>

      {!emailVerified ? (
        <Pressable
          onPress={handleResendVerification}
          disabled={busy}
          style={[styles.btn, { borderColor: colors.border, borderRadius: radius.md }]}
        >
          <Text style={[typography.caption, { color: colors.highlight }]}>
            Resend verification email
          </Text>
        </Pressable>
      ) : null}

      {hasPasswordProvider ? (
        <Pressable
          onPress={() => setPasswordModal(true)}
          style={[styles.btn, { borderColor: colors.border, borderRadius: radius.md }]}
        >
          <Text style={[typography.caption, { color: colors.textPrimary }]}>Change password</Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={confirmSignOut}
        style={[styles.btn, { borderColor: colors.border, borderRadius: radius.md }]}
      >
        <Text style={[typography.caption, { color: colors.textPrimary }]}>Sign out</Text>
      </Pressable>

      <Pressable
        onPress={confirmDelete}
        style={[styles.btn, { borderColor: colors.danger, borderRadius: radius.md }]}
      >
        <Text style={[typography.caption, { color: colors.danger }]}>Delete account</Text>
      </Pressable>

      <Modal visible={passwordModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                padding: spacing.lg,
                gap: spacing.md,
              },
            ]}
          >
            <Text style={[typography.heading, { color: colors.textPrimary }]}>Change password</Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={inputStyle}
            />
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={inputStyle}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setPasswordModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleChangePassword} disabled={busy}>
                {busy ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <Text style={{ color: colors.accent, fontWeight: "700" }}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                padding: spacing.lg,
                gap: spacing.md,
              },
            ]}
          >
            <Text style={[typography.heading, { color: colors.danger }]}>Delete account</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Enter your password to confirm permanent deletion.
            </Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={inputStyle}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setDeleteModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleDeleteAccount} disabled={busy}>
                {busy ? (
                  <ActivityIndicator color={colors.danger} />
                ) : (
                  <Text style={{ color: colors.danger, fontWeight: "700" }}>Delete</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <SimpleToast visible={toast != null} message={toast ?? ""} onDismiss={() => setToast(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  btn: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    alignItems: "center",
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
