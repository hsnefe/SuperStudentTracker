import { PropsWithChildren, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { requestNotificationPermissions } from "../notifications";
import { queryClient } from "../queryClient";
import { initCacheDb } from "../sqliteCache";
import { ThemeProvider, useThemeContext } from "../theme";

function AppShell({ children }: PropsWithChildren) {
  const { mode } = useThemeContext();

  useEffect(() => {
    void initCacheDb();
    void requestNotificationPermissions();
  }, []);

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      {children}
    </>
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppShell>{children}</AppShell>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
