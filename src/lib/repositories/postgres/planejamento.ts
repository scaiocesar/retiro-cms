import { and, asc, eq, inArray, max } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  planejamentoAtividades,
  planejamentoDias,
} from "@/lib/db/schema";
import type {
  PlanejamentoAtividade,
  PlanejamentoDia,
} from "@/lib/types";
import type {
  PlanejamentoAtividadeInput,
  PlanejamentoAtividadeUpdateInput,
  PlanejamentoDiaInput,
  PlanejamentoDiaUpdateInput,
} from "@/lib/validations/schemas";
import type { IPlanejamentoRepository } from "@/lib/repositories/interfaces";

function mapDia(row: typeof planejamentoDias.$inferSelect): PlanejamentoDia {
  return {
    id: row.id,
    eventoId: row.eventoId,
    nome: row.nome,
    ordem: row.ordem,
    horarioInicio: row.horarioInicio,
    criadoEm: row.criadoEm,
  };
}

function mapAtividade(
  row: typeof planejamentoAtividades.$inferSelect
): PlanejamentoAtividade {
  return {
    id: row.id,
    diaId: row.diaId,
    duracaoMinutos: row.duracaoMinutos,
    descricao: row.descricao,
    responsavel: row.responsavel ?? undefined,
    ordem: row.ordem,
    criadoEm: row.criadoEm,
  };
}

export class PostgresPlanejamentoRepository implements IPlanejamentoRepository {
  async findDiasByEvento(eventoId: string): Promise<PlanejamentoDia[]> {
    const rows = await getDb()
      .select()
      .from(planejamentoDias)
      .where(eq(planejamentoDias.eventoId, eventoId))
      .orderBy(asc(planejamentoDias.ordem));
    return rows.map(mapDia);
  }

  async findDiaById(id: string): Promise<PlanejamentoDia | null> {
    const [row] = await getDb()
      .select()
      .from(planejamentoDias)
      .where(eq(planejamentoDias.id, id))
      .limit(1);
    return row ? mapDia(row) : null;
  }

  async findAtividadesByDia(diaId: string): Promise<PlanejamentoAtividade[]> {
    const rows = await getDb()
      .select()
      .from(planejamentoAtividades)
      .where(eq(planejamentoAtividades.diaId, diaId))
      .orderBy(asc(planejamentoAtividades.ordem));
    return rows.map(mapAtividade);
  }

  async findAtividadesByDias(
    diaIds: string[]
  ): Promise<PlanejamentoAtividade[]> {
    if (diaIds.length === 0) return [];
    const rows = await getDb()
      .select()
      .from(planejamentoAtividades)
      .where(inArray(planejamentoAtividades.diaId, diaIds))
      .orderBy(asc(planejamentoAtividades.ordem));
    return rows.map(mapAtividade);
  }

  async findAtividadeById(id: string): Promise<PlanejamentoAtividade | null> {
    const [row] = await getDb()
      .select()
      .from(planejamentoAtividades)
      .where(eq(planejamentoAtividades.id, id))
      .limit(1);
    return row ? mapAtividade(row) : null;
  }

  async createDia(data: PlanejamentoDiaInput): Promise<PlanejamentoDia> {
    const db = getDb();
    const [agg] = await db
      .select({ maxOrdem: max(planejamentoDias.ordem) })
      .from(planejamentoDias)
      .where(eq(planejamentoDias.eventoId, data.eventoId));
    const ordem = (agg?.maxOrdem ?? -1) + 1;

    const [row] = await db
      .insert(planejamentoDias)
      .values({
        eventoId: data.eventoId,
        nome: data.nome,
        horarioInicio: data.horarioInicio,
        ordem,
      })
      .returning();
    return mapDia(row);
  }

  async updateDia(
    id: string,
    data: PlanejamentoDiaUpdateInput
  ): Promise<PlanejamentoDia | null> {
    const updates: Partial<{ nome: string; horarioInicio: string }> = {};
    if (data.nome !== undefined) updates.nome = data.nome;
    if (data.horarioInicio !== undefined) updates.horarioInicio = data.horarioInicio;
    if (Object.keys(updates).length === 0) {
      return this.findDiaById(id);
    }
    const [row] = await getDb()
      .update(planejamentoDias)
      .set(updates)
      .where(eq(planejamentoDias.id, id))
      .returning();
    return row ? mapDia(row) : null;
  }

  async deleteDia(id: string): Promise<boolean> {
    const deleted = await getDb()
      .delete(planejamentoDias)
      .where(eq(planejamentoDias.id, id))
      .returning({ id: planejamentoDias.id });
    return deleted.length > 0;
  }

  async createAtividade(
    data: PlanejamentoAtividadeInput
  ): Promise<PlanejamentoAtividade> {
    const db = getDb();
    const [agg] = await db
      .select({ maxOrdem: max(planejamentoAtividades.ordem) })
      .from(planejamentoAtividades)
      .where(eq(planejamentoAtividades.diaId, data.diaId));
    const ordem = (agg?.maxOrdem ?? -1) + 1;

    const [row] = await db
      .insert(planejamentoAtividades)
      .values({
        diaId: data.diaId,
        duracaoMinutos: data.duracaoMinutos,
        descricao: data.descricao,
        responsavel: data.responsavel || null,
        ordem,
      })
      .returning();
    return mapAtividade(row);
  }

  async updateAtividade(
    id: string,
    data: PlanejamentoAtividadeUpdateInput
  ): Promise<PlanejamentoAtividade | null> {
    const updates: Partial<{
      duracaoMinutos: number;
      descricao: string;
      responsavel: string | null;
    }> = {};
    if (data.duracaoMinutos !== undefined) updates.duracaoMinutos = data.duracaoMinutos;
    if (data.descricao !== undefined) updates.descricao = data.descricao;
    if (data.responsavel !== undefined) updates.responsavel = data.responsavel;
    if (Object.keys(updates).length === 0) {
      return this.findAtividadeById(id);
    }
    const [row] = await getDb()
      .update(planejamentoAtividades)
      .set(updates)
      .where(eq(planejamentoAtividades.id, id))
      .returning();
    return row ? mapAtividade(row) : null;
  }

  async deleteAtividade(id: string): Promise<boolean> {
    const deleted = await getDb()
      .delete(planejamentoAtividades)
      .where(eq(planejamentoAtividades.id, id))
      .returning({ id: planejamentoAtividades.id });
    return deleted.length > 0;
  }

  async reorderAtividades(
    diaId: string,
    orderedIds: string[]
  ): Promise<PlanejamentoAtividade[]> {
    const db = getDb();
    const existing = await this.findAtividadesByDia(diaId);
    const existingIds = new Set(existing.map((a) => a.id));
    if (
      orderedIds.length !== existing.length ||
      orderedIds.some((id) => !existingIds.has(id))
    ) {
      throw new Error("Lista de reordenação inválida");
    }

    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(planejamentoAtividades)
          .set({ ordem: i })
          .where(
            and(
              eq(planejamentoAtividades.id, orderedIds[i]),
              eq(planejamentoAtividades.diaId, diaId)
            )
          );
      }
    });

    return this.findAtividadesByDia(diaId);
  }
}
