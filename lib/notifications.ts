import { Platform } from "react-native";

type NotificationsModule = typeof import("expo-notifications");

let cachedModule: NotificationsModule | null = null;

function loadModule(): NotificationsModule | null {
  if (Platform.OS === "web") return null;
  if (cachedModule) return cachedModule;
  cachedModule = require("expo-notifications");
  return cachedModule;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = loadModule();
  if (!Notifications) return false;

  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;

  const request = await Notifications.requestPermissionsAsync();
  return request.granted;
}

export async function scheduleClassReminder(args: {
  identifier: string;
  title: string;
  body: string;
  fireAt: Date;
}): Promise<string | null> {
  const Notifications = loadModule();
  if (!Notifications) return null;

  await Notifications.cancelScheduledNotificationAsync(args.identifier).catch(() => undefined);

  return Notifications.scheduleNotificationAsync({
    identifier: args.identifier,
    content: { title: args.title, body: args.body },
    trigger: { type: "date", date: args.fireAt } as never,
  });
}
