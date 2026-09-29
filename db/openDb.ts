import * as SQLite from "expo-sqlite";

export type Db = SQLite.SQLiteDatabase;

export async function openDb(): Promise<Db> {
  const db = await SQLite.openDatabaseAsync("forgefit");
  await db.execAsync("PRAGMA foreign_keys = ON;");
  return db;
}

export function openDbSync(): Db {
  const db = SQLite.openDatabaseSync("forgefit");
  db.execSync("PRAGMA foreign_keys = ON;");
  return db;
}