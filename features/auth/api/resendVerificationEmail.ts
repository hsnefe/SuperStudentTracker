import { sendEmailVerification } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export async function resendVerificationEmail(): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Not signed in");
  await sendEmailVerification(user);
}
