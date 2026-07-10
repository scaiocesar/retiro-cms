import type {
  Camiseta,
  Crianca,
  Evento,
  PagamentoInscricao,
  Participante,
  ParticipanteCompleto,
  RelatorioEvento,
  UsuarioSistema,
  UsuarioSistemaPublic,
} from "@/lib/types";
import type { EventoInput, ParticipanteInput, UsuarioSistemaInput } from "@/lib/validations/schemas";

export interface IUsuarioRepository {
  findAll(): Promise<UsuarioSistemaPublic[]>;
  findById(id: string): Promise<UsuarioSistema | null>;
  findByUsername(username: string): Promise<UsuarioSistema | null>;
  create(data: UsuarioSistemaInput & { senhaHash: string }): Promise<UsuarioSistemaPublic>;
  update(id: string, data: Partial<UsuarioSistemaInput & { senhaHash?: string }>): Promise<UsuarioSistemaPublic | null>;
}

export interface IEventoRepository {
  findAll(): Promise<Evento[]>;
  findById(id: string): Promise<Evento | null>;
  findAtivos(): Promise<Evento[]>;
  create(data: EventoInput): Promise<Evento>;
  update(id: string, data: Partial<EventoInput>): Promise<Evento | null>;
}

export interface ParticipanteListFilters {
  search?: string;
  pagamentoInscricao?: PagamentoInscricao;
  ehServidor?: boolean;
}

export interface IParticipanteRepository {
  findByEvento(
    eventoId: string,
    filters?: ParticipanteListFilters
  ): Promise<ParticipanteCompleto[]>;
  findById(id: string): Promise<ParticipanteCompleto | null>;
  create(data: ParticipanteInput, criadoPor: string): Promise<ParticipanteCompleto>;
  update(id: string, data: ParticipanteInput): Promise<ParticipanteCompleto | null>;
  delete(id: string): Promise<boolean>;
  setCheckin(id: string, checkin: boolean): Promise<ParticipanteCompleto | null>;
  setCamisetaRetirada(
    camisetaId: string,
    retirada: boolean
  ): Promise<ParticipanteCompleto | null>;
}

export interface IRelatorioRepository {
  gerar(eventoId: string): Promise<RelatorioEvento | null>;
}

export type { Camiseta, Crianca, Evento, Participante, ParticipanteCompleto };
