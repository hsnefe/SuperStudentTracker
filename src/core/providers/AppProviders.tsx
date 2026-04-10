import { PropsWithChildren, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useThemeContext } from "../theme/ThemeProvider";
import { queryClient } from "../lib/queryClient";
import { initCacheDb } from "../lib/sqliteCache";
import { requestNotificationPermissions } from "../lib/notifications";

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
