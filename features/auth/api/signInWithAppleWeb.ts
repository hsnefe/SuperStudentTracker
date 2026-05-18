import { OAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export async function signInWithAppleWeb(): Promise<void> {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  await signInWithPopup(getFirebaseAuth(), provider);
}
