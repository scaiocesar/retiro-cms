import { PostgresEventoRepository } from "@/lib/repositories/postgres/evento";
import { PostgresParticipanteRepository } from "@/lib/repositories/postgres/participante";
import { PostgresRelatorioRepository } from "@/lib/repositories/postgres/relatorio";
import { PostgresUsuarioRepository } from "@/lib/repositories/postgres/usuario";
import type {
  IEventoRepository,
  IParticipanteRepository,
  IRelatorioRepository,
  IUsuarioRepository,
} from "@/lib/repositories/interfaces";

export function getUsuarioRepository(): IUsuarioRepository {
  return new PostgresUsuarioRepository();
}

export function getEventoRepository(): IEventoRepository {
  return new PostgresEventoRepository();
}

export function getParticipanteRepository(): IParticipanteRepository {
  return new PostgresParticipanteRepository();
}

export function getRelatorioRepository(): IRelatorioRepository {
  return new PostgresRelatorioRepository();
}
