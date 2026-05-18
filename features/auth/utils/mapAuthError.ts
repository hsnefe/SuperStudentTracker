import type { FirebaseError } from "firebase/app";

export function mapAuthError(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as FirebaseError).code)
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 8 characters with a number.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    case "auth/requires-recent-login":
      return "Please sign in again to complete this action.";
    case "auth/configuration-not-found":
      return "Firebase Authentication is not enabled for this project. Open Firebase Console → Authentication → Get started, then enable Email/Password under Sign-in method.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
