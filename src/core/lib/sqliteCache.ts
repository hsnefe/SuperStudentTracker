import * as SQLite from "expo-sqlite";

const dbPromise = SQLite.openDatabaseAsync("planner-cache.db");

export async function initCacheDb() {
  const db = await dbPromise;
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cache_entries (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}

export async function setCacheEntry(key: string, value: string) {
  const db = await dbPromise;
  await db.runAsync(
    "INSERT OR REPLACE INTO cache_entries (key, value, updated_at) VALUES (?, ?, ?);",
    key,
    value,
    Date.now(),
  );
}

export async function getCacheEntry(key: string) {
  const db = await dbPromise;
  return db.getFirstAsync<{ value: string; updated_at: number }>(
    "SELECT value, updated_at FROM cache_entries WHERE key = ?;",
    key,
  );
}
