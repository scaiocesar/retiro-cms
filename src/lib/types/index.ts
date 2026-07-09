export type UserRole = "ADMIN" | "USUARIO";

export type PagamentoInscricao = "NAO" | "CASH" | "VENMO" | "DOACAO";

export type PagamentoCamiseta = "NAO" | "CASH" | "VENMO" | "DOACAO";

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
}

export interface Crianca {
  id: string;
  participanteId: string;
  nome: string;
  idade: number;
}

export interface Participante {
  id: string;
  eventoId: string;
  nome: string;
  telefone: string;
  pagamentoInscricao: PagamentoInscricao;
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

export interface RelatorioEvento {
  eventoId: string;
  totalParticipantes: number;
  totalParticipantesNaoServidores: number;
  totalCriancas: number;
  totalServidores: number;
  totalPresentes: number;
  totalNaoPresentes: number;
  cashInscricao: number;
  venmoInscricao: number;
  naoPagosInscricao: number;
  doacaoInscricao: number;
  camisetasPorTamanho: Record<string, number>;
  listaCamisetas: Array<{
    participanteNome: string;
    quantidade: number;
    tamanho: string;
    idadeToddler?: number;
    pagamento: PagamentoCamiseta;
  }>;
}

export const PAGAMENTO_INSCRICAO_LABELS: Record<PagamentoInscricao, string> = {
  NAO: "Não pago",
  CASH: "Cash",
  VENMO: "Venmo",
  DOACAO: "Doação",
};

export const PAGAMENTO_CAMISETA_LABELS: Record<PagamentoCamiseta, string> = {
  NAO: "Não pago",
  CASH: "Cash",
  VENMO: "Venmo",
  DOACAO: "Doação",
};

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
