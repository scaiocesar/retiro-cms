import { v4 as uuidv4 } from "uuid";
import { isSearchActive, matchesParticipanteSearch } from "@/lib/search";
import { normalizePagamentoTipo, normalizeValorPago } from "@/lib/pagamento";
import { getStore } from "@/lib/db/in-memory-store";
import type { Camiseta, Crianca, Participante, ParticipanteCompleto } from "@/lib/types";
import type { ParticipanteInput } from "@/lib/validations/schemas";
import type {
  IParticipanteRepository,
  ParticipanteListFilters,
} from "@/lib/repositories/interfaces";

function buildCompleto(participante: Participante): ParticipanteCompleto {
  const store = getStore();
  const camisetas = Array.from(store.camisetas.values()).filter(
    (c) => c.participanteId === participante.id
  );
  const criancas = Array.from(store.criancas.values()).filter(
    (c) => c.participanteId === participante.id
  );
  return {
    ...participante,
    checkin: participante.checkin ?? false,
    camisetas,
    criancas,
  };
}

function camisetaRetiradaKey(tamanho: string, idadeToddler?: number) {
  return `${tamanho}|${idadeToddler ?? ""}`;
}

function syncCamisetas(participanteId: string, camisetas: ParticipanteInput["camisetas"]) {
  const store = getStore();
  const existing = Array.from(store.camisetas.values()).filter(
    (c) => c.participanteId === participanteId
  );

  const retiradaByKey = new Map<string, { retirada: boolean; retiradaEm?: string }>();
  for (const c of existing) {
    retiradaByKey.set(camisetaRetiradaKey(c.tamanho, c.idadeToddler), {
      retirada: c.retirada,
      retiradaEm: c.retiradaEm,
    });
  }

  for (const [id, camiseta] of store.camisetas.entries()) {
    if (camiseta.participanteId === participanteId) {
      store.camisetas.delete(id);
    }
  }
  for (const c of camisetas) {
    const prev = retiradaByKey.get(camisetaRetiradaKey(c.tamanho, c.idadeToddler));
    const camiseta: Camiseta = {
      id: uuidv4(),
      participanteId,
      quantidade: c.quantidade,
      tamanho: c.tamanho,
      idadeToddler: c.idadeToddler,
      pagamento: c.pagamento,
      valorPago: normalizeValorPago(c.pagamento, c.valorPago),
      retirada: prev?.retirada ?? false,
      retiradaEm: prev?.retiradaEm,
    };
    store.camisetas.set(camiseta.id, camiseta);
  }
}

function syncCriancas(participanteId: string, criancas: ParticipanteInput["criancas"]) {
  const store = getStore();
  for (const [id, crianca] of store.criancas.entries()) {
    if (crianca.participanteId === participanteId) {
      store.criancas.delete(id);
    }
  }
  for (const c of criancas) {
    const crianca: Crianca = {
      id: uuidv4(),
      participanteId,
      nome: c.nome,
      idade: c.idade,
      pagamento: c.pagamento,
      valorPago: normalizeValorPago(c.pagamento, c.valorPago),
    };
    store.criancas.set(crianca.id, crianca);
  }
}

export class InMemoryParticipanteRepository implements IParticipanteRepository {
  async findByEvento(
    eventoId: string,
    filters: ParticipanteListFilters = {}
  ): Promise<ParticipanteCompleto[]> {
    const store = getStore();
    let participantes = Array.from(store.participantes.values()).filter(
      (p) => p.eventoId === eventoId
    );

    const search = filters.search?.trim();
    if (search && isSearchActive(search)) {
      participantes = participantes.filter((p) =>
        matchesParticipanteSearch(p.nome, p.telefone, search)
      );
    }

    if (filters.pagamentoInscricao) {
      participantes = participantes.filter(
        (p) => p.pagamentoInscricao === filters.pagamentoInscricao
      );
    }

    if (filters.ehServidor !== undefined) {
      participantes = participantes.filter((p) => p.ehServidor === filters.ehServidor);
    }

    return participantes
      .map(buildCompleto)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async findById(id: string): Promise<ParticipanteCompleto | null> {
    const participante = getStore().participantes.get(id);
    if (!participante) return null;
    return buildCompleto(participante);
  }

  async create(data: ParticipanteInput, criadoPor: string): Promise<ParticipanteCompleto> {
    const now = new Date().toISOString();
    const participante: Participante = {
      id: uuidv4(),
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
    };
    getStore().participantes.set(participante.id, participante);
    syncCamisetas(participante.id, data.camisetas);
    syncCriancas(participante.id, data.criancas);
    return buildCompleto(participante);
  }

  async update(id: string, data: ParticipanteInput): Promise<ParticipanteCompleto | null> {
    const store = getStore();
    const existing = store.participantes.get(id);
    if (!existing) return null;

    const updated: Participante = {
      ...existing,
      eventoId: data.eventoId,
      nome: data.nome,
      telefone: data.telefone,
      pagamentoInscricao: data.pagamentoInscricao,
      valorInscricao: normalizeValorPago(data.pagamentoInscricao, data.valorInscricao),
      ehServidor: data.ehServidor,
      observacoes: data.observacoes,
      atualizadoEm: new Date().toISOString(),
    };
    store.participantes.set(id, updated);
    syncCamisetas(id, data.camisetas);
    syncCriancas(id, data.criancas);
    return buildCompleto(updated);
  }

  async delete(id: string): Promise<boolean> {
    const store = getStore();
    if (!store.participantes.has(id)) return false;

    store.participantes.delete(id);
    for (const [camisetaId, camiseta] of store.camisetas.entries()) {
      if (camiseta.participanteId === id) store.camisetas.delete(camisetaId);
    }
    for (const [criancaId, crianca] of store.criancas.entries()) {
      if (crianca.participanteId === id) store.criancas.delete(criancaId);
    }
    return true;
  }

  async setCheckin(id: string, checkin: boolean): Promise<ParticipanteCompleto | null> {
    const store = getStore();
    const existing = store.participantes.get(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated: Participante = {
      ...existing,
      checkin,
      checkinEm: checkin ? now : undefined,
      atualizadoEm: now,
    };
    store.participantes.set(id, updated);
    return buildCompleto(updated);
  }

  async setCamisetaRetirada(
    camisetaId: string,
    retirada: boolean
  ): Promise<ParticipanteCompleto | null> {
    const store = getStore();
    const camiseta = store.camisetas.get(camisetaId);
    if (!camiseta) return null;

    const now = new Date().toISOString();
    store.camisetas.set(camisetaId, {
      ...camiseta,
      retirada,
      retiradaEm: retirada ? now : undefined,
    });

    const participante = store.participantes.get(camiseta.participanteId);
    if (!participante) return null;
    return buildCompleto(participante);
  }
}
