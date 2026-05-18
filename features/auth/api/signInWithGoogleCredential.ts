import {
  GoogleAuthProvider,
  linkWithCredential,
  signInWithCredential,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { mapAuthError } from "../utils/mapAuthError";

export async function signInWithGoogleIdToken(idToken: string): Promise<void> {
  const auth = getFirebaseAuth();
  const credential = GoogleAuthProvider.credential(idToken);

  try {
    await signInWithCredential(auth, credential);
  } catch (error: unknown) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: string }).code)
        : "";

    if (code === "auth/account-exists-with-different-credential" && auth.currentUser) {
      await linkWithCredential(auth.currentUser, credential);
      return;
    }

    throw new Error(mapAuthError(error));
  }
}
