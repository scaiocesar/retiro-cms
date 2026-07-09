import path from "node:path";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

let migrated = false;

async function migrateLegacyDoacao(db: ReturnType<typeof drizzle>) {
  await db.execute(
    sql`UPDATE "participantes" SET "pagamento_inscricao" = 'FREE' WHERE "pagamento_inscricao" = 'DOACAO'`
  );
  await db.execute(
    sql`UPDATE "camisetas" SET "pagamento" = 'FREE' WHERE "pagamento" = 'DOACAO'`
  );
  await db.execute(
    sql`UPDATE "criancas" SET "pagamento" = 'FREE' WHERE "pagamento" = 'DOACAO'`
  );
}

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

  await migrateLegacyDoacao(db);

  await client.end();
  migrated = true;
}
