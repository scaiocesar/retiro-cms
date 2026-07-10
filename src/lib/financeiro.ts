import type { PagamentoTipo } from "@/lib/pagamento";
import type { ParticipanteCompleto } from "@/lib/types";

export interface ResumoFinanceiro {
  valorDinheiroInscricao: number;
  valorVenmoInscricao: number;
  valorDinheiroCamiseta: number;
  valorVenmoCamiseta: number;
  totalValorInscricao: number;
  totalValorCamiseta: number;
  totalDinheiro: number;
  totalVenmo: number;
  totalGeral: number;
}

function valorPorMetodo(pagamento: PagamentoTipo, valor?: number) {
  const amount = valor ?? 0;
  if (pagamento === "CASH") return { cash: amount, venmo: 0 };
  if (pagamento === "VENMO") return { cash: 0, venmo: amount };
  return { cash: 0, venmo: 0 };
}

export function calcularResumoFinanceiro(
  participantes: ParticipanteCompleto[]
): ResumoFinanceiro {
  let valorDinheiroInscricao = 0;
  let valorVenmoInscricao = 0;
  let valorDinheiroCamiseta = 0;
  let valorVenmoCamiseta = 0;

  for (const p of participantes) {
    const valorInscricao = p.valorInscricao ?? 0;
    const inscricao = valorPorMetodo(p.pagamentoInscricao, valorInscricao);
    valorDinheiroInscricao += inscricao.cash;
    valorVenmoInscricao += inscricao.venmo;

    if (p.camisetas.length > 0) {
      const camiseta = p.camisetas[0];
      const valorCamiseta = camiseta.valorPago ?? 0;
      const camisetaPay = valorPorMetodo(camiseta.pagamento, valorCamiseta);
      valorDinheiroCamiseta += camisetaPay.cash;
      valorVenmoCamiseta += camisetaPay.venmo;
    }

    for (const crianca of p.criancas) {
      const valorCrianca = crianca.valorPago ?? 0;
      const criancaPay = valorPorMetodo(crianca.pagamento, valorCrianca);
      valorDinheiroInscricao += criancaPay.cash;
      valorVenmoInscricao += criancaPay.venmo;
    }
  }

  const totalValorInscricao = valorDinheiroInscricao + valorVenmoInscricao;
  const totalValorCamiseta = valorDinheiroCamiseta + valorVenmoCamiseta;
  const totalDinheiro = valorDinheiroInscricao + valorDinheiroCamiseta;
  const totalVenmo = valorVenmoInscricao + valorVenmoCamiseta;

  return {
    valorDinheiroInscricao,
    valorVenmoInscricao,
    valorDinheiroCamiseta,
    valorVenmoCamiseta,
    totalValorInscricao,
    totalValorCamiseta,
    totalDinheiro,
    totalVenmo,
    totalGeral: totalDinheiro + totalVenmo,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
