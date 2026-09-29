import type { Db } from "../openDb";
import { SCHEMA_SQL, DROP_ALL_SQL } from "../schema";

export type Migration = {
  version: number;
  up: (db: Db) => Promise<void>;
};

const m0001: Migration = {
  version: 1,
  async up(db: Db) {
    await db.execAsync(SCHEMA_SQL);
  },
};

export const migrations: Migration[] = [m0001];

export async function migrate(db: Db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      appliedAt INTEGER NOT NULL
    );
  `);

  const rows = await db.getAllAsync<{ version: number }>(
    "SELECT version FROM schema_migrations;"
  );
  const applied = new Set(rows.map((r) => r.version));

  for (const m of migrations) {
    if (applied.has(m.version)) continue;
    await db.execAsync("BEGIN;");
    try {
      await m.up(db);
      await db.runAsync(
        "INSERT INTO schema_migrations (version, appliedAt) VALUES (?, ?);",
        [m.version, Date.now()]
      );
      await db.execAsync("COMMIT;");
    } catch (e) {
      await db.execAsync("ROLLBACK;");
      throw e;
    }
  }
}

export async function resetDatabase(db: Db) {
  await db.execAsync(DROP_ALL_SQL);
  await db.execAsync("DROP TABLE IF EXISTS schema_migrations;");
  await migrate(db);
}