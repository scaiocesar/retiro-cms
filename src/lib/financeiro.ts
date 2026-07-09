import type { PagamentoTipo } from "@/lib/pagamento";
import type { ParticipanteCompleto } from "@/lib/types";

export interface ResumoFinanceiro {
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
  let totalValorInscricao = 0;
  let totalValorCamiseta = 0;
  let totalDinheiro = 0;
  let totalVenmo = 0;

  for (const p of participantes) {
    const valorInscricao = p.valorInscricao ?? 0;
    totalValorInscricao += valorInscricao;
    const inscricao = valorPorMetodo(p.pagamentoInscricao, valorInscricao);
    totalDinheiro += inscricao.cash;
    totalVenmo += inscricao.venmo;

    if (p.camisetas.length > 0) {
      const camiseta = p.camisetas[0];
      const valorCamiseta = camiseta.valorPago ?? 0;
      totalValorCamiseta += valorCamiseta;
      const camisetaPay = valorPorMetodo(camiseta.pagamento, valorCamiseta);
      totalDinheiro += camisetaPay.cash;
      totalVenmo += camisetaPay.venmo;
    }

    for (const crianca of p.criancas) {
      const valorCrianca = crianca.valorPago ?? 0;
      const criancaPay = valorPorMetodo(crianca.pagamento, valorCrianca);
      totalDinheiro += criancaPay.cash;
      totalVenmo += criancaPay.venmo;
    }
  }

  return {
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
