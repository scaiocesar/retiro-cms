import { InMemoryEventoRepository } from "@/lib/repositories/in-memory/evento";
import { InMemoryParticipanteRepository } from "@/lib/repositories/in-memory/participante";
import { InMemoryRelatorioRepository } from "@/lib/repositories/in-memory/relatorio";
import { InMemoryUsuarioRepository } from "@/lib/repositories/in-memory/usuario";
import type {
  IEventoRepository,
  IParticipanteRepository,
  IRelatorioRepository,
  IUsuarioRepository,
} from "@/lib/repositories/interfaces";

export function getUsuarioRepository(): IUsuarioRepository {
  return new InMemoryUsuarioRepository();
}

export function getEventoRepository(): IEventoRepository {
  return new InMemoryEventoRepository();
}

export function getParticipanteRepository(): IParticipanteRepository {
  return new InMemoryParticipanteRepository();
}

export function getRelatorioRepository(): IRelatorioRepository {
  return new InMemoryRelatorioRepository();
}
