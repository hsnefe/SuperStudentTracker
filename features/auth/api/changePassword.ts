import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user?.email) throw new Error("Not signed in with email");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}
