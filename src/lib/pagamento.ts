export const PAGAMENTO_TIPOS = ["NAO", "CASH", "VENMO", "FREE"] as const;

export type PagamentoTipo = (typeof PAGAMENTO_TIPOS)[number];

export const PAGAMENTO_LABELS: Record<PagamentoTipo, string> = {
  NAO: "Não pago",
  CASH: "Cash",
  VENMO: "Venmo",
  FREE: "Free",
};

export function normalizePagamentoTipo(value: string): PagamentoTipo {
  if (value === "DOACAO") return "FREE";
  return value as PagamentoTipo;
}

export function pagamentoExigeValor(pagamento: PagamentoTipo): boolean {
  return pagamento === "CASH" || pagamento === "VENMO";
}

export function normalizeValorPago(
  pagamento: PagamentoTipo,
  valor?: number | null
): number | undefined {
  if (pagamento === "NAO" || pagamento === "FREE") return undefined;
  if (valor === undefined || valor === null || Number.isNaN(valor)) return undefined;
  return valor;
}
