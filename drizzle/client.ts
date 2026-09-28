import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, openDatabaseAsync } from "expo-sqlite";
import * as schema from "./schema";
import { Platform } from "react-native";

// Since expo-sqlite on Web does not support sync operations safely without timing out,
// we will export an async initializer for the DB and a synchronous getter that will
// throw if accessed before initialization is complete.

let _sqliteDb: ReturnType<typeof openDatabaseSync> | null = null;
let _drizzleDb: ReturnType<typeof drizzle> | null = null;
let _initPromise: Promise<ReturnType<typeof drizzle>> | null = null;

export async function initializeDbAsync() {
  if (_drizzleDb) return _drizzleDb;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    if (Platform.OS === "web") {
      // WEB: Use async API with Web Workers + WASM
      const sqliteAsync = await openDatabaseAsync("forgefit", {
        enableChangeListener: true,
        useNewConnection: true,
      });
      _sqliteDb = sqliteAsync as unknown as ReturnType<typeof openDatabaseSync>;
    } else {
      // NATIVE (iOS/Android): Use SYNC API — openDatabaseAsync DOES NOT WORK on native
      _sqliteDb = openDatabaseSync("forgefit", {
        enableChangeListener: true,
      });
    }
    _drizzleDb = drizzle(_sqliteDb, { schema });
    return _drizzleDb;
  })();

  return _initPromise;
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
type DbType = ReturnType<typeof drizzle<typeof schema>>;
export const db = new Proxy({} as DbType, {
  get: (target, prop) => {
    return getDb()[prop as keyof DbType];
  },
}) as DbType;
