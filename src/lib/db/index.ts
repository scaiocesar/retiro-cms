import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  var __retiroDb: Database | undefined;
  var __retiroSql: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL não configurada");
  }

  const client = postgres(url, { max: 10 });
  const db = drizzle(client, { schema });
  return { db, client };
}

export function getDb(): Database {
  if (!global.__retiroDb) {
    const { db, client } = createClient();
    global.__retiroDb = db;
    global.__retiroSql = client;
  }
  return global.__retiroDb;
}

export function getSqlClient() {
  getDb();
  return global.__retiroSql!;
}
