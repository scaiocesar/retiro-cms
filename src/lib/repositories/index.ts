import { PostgresEventoRepository } from "@/lib/repositories/postgres/evento";
import { PostgresLoginHistoricoRepository } from "@/lib/repositories/postgres/login-historico";
import { PostgresParticipanteRepository } from "@/lib/repositories/postgres/participante";
import { PostgresPlanejamentoRepository } from "@/lib/repositories/postgres/planejamento";
import { PostgresRelatorioRepository } from "@/lib/repositories/postgres/relatorio";
import { PostgresUsuarioRepository } from "@/lib/repositories/postgres/usuario";
import type {
  IEventoRepository,
  ILoginHistoricoRepository,
  IParticipanteRepository,
  IPlanejamentoRepository,
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

export function getPlanejamentoRepository(): IPlanejamentoRepository {
  return new PostgresPlanejamentoRepository();
}

export function getLoginHistoricoRepository(): ILoginHistoricoRepository {
  return new PostgresLoginHistoricoRepository();
}
