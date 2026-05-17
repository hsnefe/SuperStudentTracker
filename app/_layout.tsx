import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { AppProviders } from "@/lib/providers";

export default function RootLayout() {
  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7745/ingest/b513b559-30fc-4e04-927f-ab5e4bc17f6b", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "500a3d",
      },
      body: JSON.stringify({
        sessionId: "500a3d",
        location: "app/_layout.tsx:RootLayout",
        message: "Root layout mounted",
        data: { platform: Platform.OS },
        timestamp: Date.now(),
        hypothesisId: "H3",
        runId: "pre-fix",
      }),
    }).catch(() => {});
  }, []);
  // #endregion

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course" options={{ animation: "none" }} />
      </Stack>
    </AppProviders>
  );
}
