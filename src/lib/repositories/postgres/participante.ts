import { and, asc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { camisetas, criancas, participantes } from "@/lib/db/schema";
import { phoneDigits } from "@/lib/phone-mask";
import { normalizePagamentoTipo, normalizeValorPago } from "@/lib/pagamento";
import { isSearchActive, MIN_SEARCH_LENGTH } from "@/lib/search";
import type {
  Camiseta,
  Crianca,
  Participante,
  ParticipanteCompleto,
} from "@/lib/types";
import type { ParticipanteInput } from "@/lib/validations/schemas";
import type {
  IParticipanteRepository,
  ParticipanteListFilters,
} from "@/lib/repositories/interfaces";

function mapParticipante(row: typeof participantes.$inferSelect): Participante {
  return {
    id: row.id,
    eventoId: row.eventoId,
    nome: row.nome,
    telefone: row.telefone,
    pagamentoInscricao: normalizePagamentoTipo(row.pagamentoInscricao),
    valorInscricao: row.valorInscricao ?? undefined,
    ehServidor: row.ehServidor,
    observacoes: row.observacoes ?? undefined,
    checkin: row.checkin,
    checkinEm: row.checkinEm ?? undefined,
    criadoPor: row.criadoPor,
    criadoEm: row.criadoEm,
    atualizadoEm: row.atualizadoEm,
  };
}

function mapCamiseta(row: typeof camisetas.$inferSelect): Camiseta {
  return {
    id: row.id,
    participanteId: row.participanteId,
    quantidade: row.quantidade,
    tamanho: row.tamanho,
    idadeToddler: row.idadeToddler ?? undefined,
    pagamento: normalizePagamentoTipo(row.pagamento),
    valorPago: row.valorPago ?? undefined,
    retirada: row.retirada,
    retiradaEm: row.retiradaEm ?? undefined,
  };
}

function camisetaRetiradaKey(tamanho: string, idadeToddler?: number | null) {
  return `${tamanho}|${idadeToddler ?? ""}`;
}

function mapCrianca(row: typeof criancas.$inferSelect): Crianca {
  return {
    id: row.id,
    participanteId: row.participanteId,
    nome: row.nome,
    idade: row.idade,
    pagamento: normalizePagamentoTipo(row.pagamento),
    valorPago: row.valorPago ?? undefined,
  };
}

async function loadCompletos(
  rows: (typeof participantes.$inferSelect)[]
): Promise<ParticipanteCompleto[]> {
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const db = getDb();

  const [camisetasRows, criancasRows] = await Promise.all([
    db.select().from(camisetas).where(inArray(camisetas.participanteId, ids)),
    db.select().from(criancas).where(inArray(criancas.participanteId, ids)),
  ]);

  const camisetasByParticipante = new Map<string, Camiseta[]>();
  for (const row of camisetasRows) {
    const list = camisetasByParticipante.get(row.participanteId) ?? [];
    list.push(mapCamiseta(row));
    camisetasByParticipante.set(row.participanteId, list);
  }

  const criancasByParticipante = new Map<string, Crianca[]>();
  for (const row of criancasRows) {
    const list = criancasByParticipante.get(row.participanteId) ?? [];
    list.push(mapCrianca(row));
    criancasByParticipante.set(row.participanteId, list);
  }

  return rows.map((row) => ({
    ...mapParticipante(row),
    camisetas: camisetasByParticipante.get(row.id) ?? [],
    criancas: criancasByParticipante.get(row.id) ?? [],
  }));
}

function buildSearchCondition(search: string) {
  const term = search.trim();
  const namePattern = `%${term}%`;
  const phoneTerm = phoneDigits(term);

  if (phoneTerm.length >= MIN_SEARCH_LENGTH) {
    return or(
      ilike(participantes.nome, namePattern),
      sql`regexp_replace(${participantes.telefone}, '\\D', '', 'g') like ${`%${phoneTerm}%`}`
    );
  }

  return ilike(participantes.nome, namePattern);
}

async function syncCamisetas(
  participanteId: string,
  items: ParticipanteInput["camisetas"]
) {
  const db = getDb();
  const existing = await db
    .select()
    .from(camisetas)
    .where(eq(camisetas.participanteId, participanteId));

  const retiradaByKey = new Map<
    string,
    { retirada: boolean; retiradaEm: string | null }
  >();
  for (const row of existing) {
    retiradaByKey.set(camisetaRetiradaKey(row.tamanho, row.idadeToddler), {
      retirada: row.retirada,
      retiradaEm: row.retiradaEm,
    });
  }

  await db.delete(camisetas).where(eq(camisetas.participanteId, participanteId));

  if (items.length === 0) return;

  await db.insert(camisetas).values(
    items.map((item) => {
      const prev = retiradaByKey.get(camisetaRetiradaKey(item.tamanho, item.idadeToddler));
      return {
        participanteId,
        quantidade: item.quantidade,
        tamanho: item.tamanho,
        idadeToddler: item.idadeToddler,
        pagamento: item.pagamento,
        valorPago: normalizeValorPago(item.pagamento, item.valorPago),
        retirada: prev?.retirada ?? false,
        retiradaEm: prev?.retiradaEm ?? null,
      };
    })
  );
}

async function syncCriancas(participanteId: string, items: ParticipanteInput["criancas"]) {
  const db = getDb();
  await db.delete(criancas).where(eq(criancas.participanteId, participanteId));

  if (items.length === 0) return;

  await db.insert(criancas).values(
    items.map((item) => ({
      participanteId,
      nome: item.nome,
      idade: item.idade,
      pagamento: item.pagamento,
      valorPago: normalizeValorPago(item.pagamento, item.valorPago),
    }))
  );
}

export class PostgresParticipanteRepository implements IParticipanteRepository {
  async findByEvento(
    eventoId: string,
    filters: ParticipanteListFilters = {}
  ): Promise<ParticipanteCompleto[]> {
    const conditions = [eq(participantes.eventoId, eventoId)];

    const search = filters.search?.trim();
    if (search && isSearchActive(search)) {
      conditions.push(buildSearchCondition(search)!);
    }

    if (filters.pagamentoInscricao) {
      conditions.push(eq(participantes.pagamentoInscricao, filters.pagamentoInscricao));
    }

    if (filters.ehServidor !== undefined) {
      conditions.push(eq(participantes.ehServidor, filters.ehServidor));
    }

    const rows = await getDb()
      .select()
      .from(participantes)
      .where(and(...conditions))
      .orderBy(asc(participantes.nome));

    return loadCompletos(rows);
  }

  async findById(id: string): Promise<ParticipanteCompleto | null> {
    const [row] = await getDb()
      .select()
      .from(participantes)
      .where(eq(participantes.id, id))
      .limit(1);

    if (!row) return null;
    const [completo] = await loadCompletos([row]);
    return completo;
  }

  async create(data: ParticipanteInput, criadoPor: string): Promise<ParticipanteCompleto> {
    const db = getDb();
    const now = new Date().toISOString();

    const [row] = await db
      .insert(participantes)
      .values({
        eventoId: data.eventoId,
        nome: data.nome,
        telefone: data.telefone,
        pagamentoInscricao: data.pagamentoInscricao,
        valorInscricao: normalizeValorPago(data.pagamentoInscricao, data.valorInscricao),
        ehServidor: data.ehServidor,
        observacoes: data.observacoes,
        checkin: false,
        criadoPor,
        criadoEm: now,
        atualizadoEm: now,
      })
      .returning();

    await syncCamisetas(row.id, data.camisetas);
    await syncCriancas(row.id, data.criancas);

    const completo = await this.findById(row.id);
    if (!completo) throw new Error("Falha ao criar participante");
    return completo;
  }

  async update(id: string, data: ParticipanteInput): Promise<ParticipanteCompleto | null> {
    const [row] = await getDb()
      .update(participantes)
      .set({
        eventoId: data.eventoId,
        nome: data.nome,
        telefone: data.telefone,
        pagamentoInscricao: data.pagamentoInscricao,
        valorInscricao: normalizeValorPago(data.pagamentoInscricao, data.valorInscricao),
        ehServidor: data.ehServidor,
        observacoes: data.observacoes,
        atualizadoEm: new Date().toISOString(),
      })
      .where(eq(participantes.id, id))
      .returning();

    if (!row) return null;

    await syncCamisetas(id, data.camisetas);
    await syncCriancas(id, data.criancas);

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await getDb()
      .delete(participantes)
      .where(eq(participantes.id, id))
      .returning({ id: participantes.id });

    return deleted.length > 0;
  }

  async setCheckin(id: string, checkin: boolean): Promise<ParticipanteCompleto | null> {
    const now = new Date().toISOString();
    const [row] = await getDb()
      .update(participantes)
      .set({
        checkin,
        checkinEm: checkin ? now : null,
        atualizadoEm: now,
      })
      .where(eq(participantes.id, id))
      .returning();

    if (!row) return null;
    return this.findById(id);
  }

  async setCamisetaRetirada(
    camisetaId: string,
    retirada: boolean
  ): Promise<ParticipanteCompleto | null> {
    const db = getDb();
    const [existing] = await db
      .select()
      .from(camisetas)
      .where(eq(camisetas.id, camisetaId))
      .limit(1);

    if (!existing) return null;

    if (retirada && existing.pagamento === "NAO") {
      throw new Error("Não é possível retirar camiseta não paga");
    }

    const now = new Date().toISOString();
    const [row] = await db
      .update(camisetas)
      .set({
        retirada,
        retiradaEm: retirada ? now : null,
      })
      .where(eq(camisetas.id, camisetaId))
      .returning();

    if (!row) return null;
    return this.findById(row.participanteId);
  }
}
