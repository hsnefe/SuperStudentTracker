import { Platform } from "react-native";

type SqliteModule = typeof import("expo-sqlite");

let dbInstance: ReturnType<SqliteModule["openDatabaseSync"]> | null = null;

export function getLocalDb(): ReturnType<SqliteModule["openDatabaseSync"]> | null {
  if (Platform.OS === "web") return null;
  if (dbInstance) return dbInstance;

  const sqlite: SqliteModule = require("expo-sqlite");
  dbInstance = sqlite.openDatabaseSync("super-student-tracker.db");
  dbInstance.execSync(
    `CREATE TABLE IF NOT EXISTS cache (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );`,
  );
  return dbInstance;
}

export function readCache<T>(key: string): T | null {
  const db = getLocalDb();
  if (!db) return null;
  const row = db.getFirstSync<{ value: string }>(
    "SELECT value FROM cache WHERE key = ?",
    key,
  );
  if (!row) return null;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

export function writeCache(key: string, value: unknown): void {
  const db = getLocalDb();
  if (!db) return;
  db.runSync(
    "INSERT OR REPLACE INTO cache (key, value, updated_at) VALUES (?, ?, ?)",
    key,
    JSON.stringify(value),
    Date.now(),
  );
}
