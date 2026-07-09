import { v4 as uuidv4 } from "uuid";
import { getStore } from "@/lib/db/in-memory-store";
import type { Evento } from "@/lib/types";
import type { EventoInput } from "@/lib/validations/schemas";
import type { IEventoRepository } from "@/lib/repositories/interfaces";

export class InMemoryEventoRepository implements IEventoRepository {
  async findAll(): Promise<Evento[]> {
    const store = getStore();
    return Array.from(store.eventos.values()).sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  }

  async findById(id: string): Promise<Evento | null> {
    return getStore().eventos.get(id) ?? null;
  }

  async findAtivos(): Promise<Evento[]> {
    const eventos = await this.findAll();
    return eventos.filter((e) => e.ativo);
  }

  async create(data: EventoInput): Promise<Evento> {
    const evento: Evento = {
      id: uuidv4(),
      nome: data.nome,
      data: data.data,
      ativo: data.ativo ?? true,
      criadoEm: new Date().toISOString(),
    };
    getStore().eventos.set(evento.id, evento);
    return evento;
  }

  async update(id: string, data: Partial<EventoInput>): Promise<Evento | null> {
    const store = getStore();
    const existing = store.eventos.get(id);
    if (!existing) return null;

    const updated: Evento = {
      ...existing,
      ...data,
    };
    store.eventos.set(id, updated);
    return updated;
  }
}
