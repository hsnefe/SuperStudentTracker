import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<void> {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const trimmedName = displayName.trim();
  if (trimmedName) {
    await updateProfile(credential.user, { displayName: trimmedName });
  }
  await sendEmailVerification(credential.user);
}
