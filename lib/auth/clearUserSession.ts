import type { QueryClient } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { clearAllUserCache } from "@/lib/sqliteCache";
import { clearPersistenceMemoryCaches } from "@/lib/persistence/memoryCaches";

export async function clearUserSession(queryClient: QueryClient): Promise<void> {
  try {
    await signOut(getFirebaseAuth());
  } catch {
    /* already signed out */
  }
  queryClient.clear();
  clearAllUserCache();
  clearPersistenceMemoryCaches();
}
