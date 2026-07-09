import type { PagamentoInscricao } from "@/lib/types";
import { PAGAMENTO_TIPOS } from "@/lib/pagamento";

const PAGAMENTO_INSCRICAO_VALUES: PagamentoInscricao[] = [...PAGAMENTO_TIPOS];

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
