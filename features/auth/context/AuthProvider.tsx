import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { clearUserSession } from "@/lib/auth/clearUserSession";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  emailVerified: boolean;
  reloadUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setUser(null);
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const reloadUser = useCallback(async () => {
    const current = getFirebaseAuth().currentUser;
    if (!current) return;
    await current.reload();
    setUser(getFirebaseAuth().currentUser);
  }, []);

  const signOut = useCallback(async () => {
    await clearUserSession(queryClient);
    setUser(null);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      emailVerified: user?.emailVerified ?? false,
      reloadUser,
      signOut,
    }),
    [user, loading, reloadUser, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
