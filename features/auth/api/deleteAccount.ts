import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";
import type { AuthCredential } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export async function deleteAccountWithPassword(currentPassword: string): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user?.email) throw new Error("Not signed in");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await deleteUser(user);
}

export async function deleteAccountWithCredential(credential: AuthCredential): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Not signed in");

  await reauthenticateWithCredential(user, credential);
  await deleteUser(user);
}
