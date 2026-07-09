import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { eventos } from "@/lib/db/schema";
import type { Evento } from "@/lib/types";
import type { EventoInput } from "@/lib/validations/schemas";
import type { IEventoRepository } from "@/lib/repositories/interfaces";

function mapRow(row: typeof eventos.$inferSelect): Evento {
  return {
    id: row.id,
    nome: row.nome,
    data: row.data,
    ativo: row.ativo,
    criadoEm: row.criadoEm,
  };
}

export class PostgresEventoRepository implements IEventoRepository {
  async findAll(): Promise<Evento[]> {
    const rows = await getDb().select().from(eventos).orderBy(desc(eventos.data));
    return rows.map(mapRow);
  }

  async findById(id: string): Promise<Evento | null> {
    const [row] = await getDb().select().from(eventos).where(eq(eventos.id, id)).limit(1);
    return row ? mapRow(row) : null;
  }

  async findAtivos(): Promise<Evento[]> {
    const rows = await getDb()
      .select()
      .from(eventos)
      .where(eq(eventos.ativo, true))
      .orderBy(desc(eventos.data));
    return rows.map(mapRow);
  }

  async create(data: EventoInput): Promise<Evento> {
    const [row] = await getDb()
      .insert(eventos)
      .values({
        nome: data.nome,
        data: data.data,
        ativo: data.ativo ?? true,
      })
      .returning();
    return mapRow(row);
  }

  async update(id: string, data: Partial<EventoInput>): Promise<Evento | null> {
    const [row] = await getDb()
      .update(eventos)
      .set(data)
      .where(eq(eventos.id, id))
      .returning();
    return row ? mapRow(row) : null;
  }
}
