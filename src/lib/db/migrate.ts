import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

let migrated = false;

export async function runMigrations(): Promise<void> {
  if (migrated) return;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL não configurada");
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle/migrations"),
  });

  await client.end();
  migrated = true;
}
