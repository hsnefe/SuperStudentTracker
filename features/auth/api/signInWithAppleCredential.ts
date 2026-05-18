import { OAuthProvider, signInWithCredential } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export async function signInWithAppleCredential(
  idToken: string,
  rawNonce?: string,
): Promise<void> {
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({
    idToken,
    rawNonce,
  });
  await signInWithCredential(getFirebaseAuth(), credential);
}
