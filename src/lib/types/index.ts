export type UserRole = "ADMIN" | "USUARIO";

import type { PagamentoTipo } from "@/lib/pagamento";

export type PagamentoInscricao = PagamentoTipo;
export type PagamentoCamiseta = PagamentoTipo;
export type PagamentoCrianca = PagamentoTipo;

export type TamanhoCamiseta =
  | "TODDLER"
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "2XL"
  | "3XL"
  | "4XL";

export interface UsuarioSistema {
  id: string;
  nome: string;
  username: string;
  senhaHash: string;
  role: UserRole;
  ativo: boolean;
  criadoEm: string;
}

export interface UsuarioSistemaPublic {
  id: string;
  nome: string;
  username: string;
  role: UserRole;
  ativo: boolean;
  criadoEm: string;
}

export interface Evento {
  id: string;
  nome: string;
  data: string;
  ativo: boolean;
  criadoEm: string;
}

export interface Camiseta {
  id: string;
  participanteId: string;
  quantidade: number;
  tamanho: TamanhoCamiseta;
  idadeToddler?: number;
  pagamento: PagamentoCamiseta;
  valorPago?: number;
  retirada: boolean;
  retiradaEm?: string;
}

export interface Crianca {
  id: string;
  participanteId: string;
  nome: string;
  idade: number;
  pagamento: PagamentoCrianca;
  valorPago?: number;
}

export interface Participante {
  id: string;
  eventoId: string;
  nome: string;
  telefone: string;
  pagamentoInscricao: PagamentoInscricao;
  valorInscricao?: number;
  ehServidor: boolean;
  observacoes?: string;
  checkin: boolean;
  checkinEm?: string;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ParticipanteCompleto extends Participante {
  camisetas: Camiseta[];
  criancas: Crianca[];
}

export interface PlanejamentoAtividade {
  id: string;
  diaId: string;
  duracaoMinutos: number;
  descricao: string;
  responsavel?: string;
  ordem: number;
  criadoEm: string;
}

export interface PlanejamentoAtividadeComHorario extends PlanejamentoAtividade {
  horarioInicio: string;
  horarioFim: string;
}

export interface PlanejamentoDia {
  id: string;
  eventoId: string;
  nome: string;
  ordem: number;
  horarioInicio: string;
  criadoEm: string;
}

export interface PlanejamentoDiaCompleto extends PlanejamentoDia {
  atividades: PlanejamentoAtividadeComHorario[];
  horarioTermino?: string;
}

export interface RelatorioEvento {
  eventoId: string;
  totalParticipantes: number;
  totalPessoas: number;
  totalParticipantesNaoServidores: number;
  totalCriancas: number;
  totalServidores: number;
  totalPresentes: number;
  totalNaoPresentes: number;
  cashInscricao: number;
  venmoInscricao: number;
  naoPagosInscricao: number;
  freeInscricao: number;
  valorDinheiroInscricao: number;
  valorVenmoInscricao: number;
  valorDinheiroCamiseta: number;
  valorVenmoCamiseta: number;
  totalValorInscricao: number;
  totalValorCamiseta: number;
  totalDinheiro: number;
  totalVenmo: number;
  totalGeral: number;
  camisetasPagas: number;
  camisetasNaoPagas: number;
  camisetasFree: number;
  camisetasRetiradas: number;
  camisetasPendentes: number;
  camisetasPorTamanho: Record<string, number>;
  listaCamisetas: Array<{
    participanteNome: string;
    quantidade: number;
    tamanho: string;
    idadeToddler?: number;
    pagamento: PagamentoCamiseta;
  }>;
}

import { PAGAMENTO_LABELS } from "@/lib/pagamento";

export const PAGAMENTO_INSCRICAO_LABELS = PAGAMENTO_LABELS;
export const PAGAMENTO_CAMISETA_LABELS = PAGAMENTO_LABELS;
export const PAGAMENTO_CRIANCA_LABELS = PAGAMENTO_LABELS;

export const TAMANHO_CAMISETA_LABELS: Record<TamanhoCamiseta, string> = {
  TODDLER: "Toddler",
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  "2XL": "2XL",
  "3XL": "3XL",
  "4XL": "4XL",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  USUARIO: "Usuário",
};
