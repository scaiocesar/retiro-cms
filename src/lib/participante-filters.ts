import type { PagamentoInscricao } from "@/lib/types";

const PAGAMENTO_INSCRICAO_VALUES: PagamentoInscricao[] = [
  "NAO",
  "CASH",
  "VENMO",
  "DOACAO",
];

export function parsePagamentoInscricaoFilter(
  value: string | null
): PagamentoInscricao | undefined {
  if (!value) return undefined;
  return PAGAMENTO_INSCRICAO_VALUES.includes(value as PagamentoInscricao)
    ? (value as PagamentoInscricao)
    : undefined;
}

export function parseEhServidorFilter(value: string | null): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}
