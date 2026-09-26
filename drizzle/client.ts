import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, openDatabaseAsync } from "expo-sqlite";
import * as schema from "./schema";
import { Platform } from "react-native";

// Since expo-sqlite on Web does not support sync operations safely without timing out,
// we will export an async initializer for the DB and a synchronous getter that will
// throw if accessed before initialization is complete.

let _sqliteDb: ReturnType<typeof openDatabaseSync> | null = null;
let _drizzleDb: ReturnType<typeof drizzle> | null = null;

export async function initializeDbAsync() {
  if (!_sqliteDb) {
    // We MUST use openDatabaseAsync on Web to prevent blocking the UI thread
    const sqliteAsync = await openDatabaseAsync("forgefit", {
      enableChangeListener: true,
      useNewConnection: true, // Forces IndexedDB reconnection if previous page didn't close it cleanly
    });

    // expo-sqlite typing requires a synchronous db object for drizzle, but on web
    // openDatabaseAsync returns a WebSQLiteDatabase that implements the same interface.
    _sqliteDb = sqliteAsync as unknown as ReturnType<typeof openDatabaseSync>;
    _drizzleDb = drizzle(_sqliteDb, { schema });
  }
  return _drizzleDb;
}

export function getDb() {
  if (!_drizzleDb) {
    if (Platform.OS === "web") {
      throw new Error(
        "Database not initialized. Call initializeDbAsync first on web.",
      );
    } else {
      // Fallback to sync initialization on native devices which is perfectly fine
      _sqliteDb = openDatabaseSync("forgefit", {
        enableChangeListener: true,
      });
      _drizzleDb = drizzle(_sqliteDb, { schema });
    }
  }
  return _drizzleDb;
}

// Export a dummy/proxy for the static exports that expect 'db' to be immediately available.
export const db = new Proxy({} as any, {
  get: (target, prop) => {
    return getDb()[prop as keyof typeof _drizzleDb];
  },
});
