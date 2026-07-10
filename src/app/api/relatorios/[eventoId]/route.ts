import { ensureSeed } from "@/lib/db/seed";
import { apiSuccess, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/helpers";
import { RelatorioService } from "@/lib/services";
import { PAGAMENTO_CAMISETA_LABELS } from "@/lib/types";

type RouteContext = { params: Promise<{ eventoId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    await ensureSeed();
    await requireAuth();
    const { eventoId } = await context.params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    const service = new RelatorioService();
    const relatorio = await service.gerar(eventoId);

    if (format === "csv") {
      const lines = [
        "Participante,Quantidade,Tamanho,Pagamento Camiseta",
        ...relatorio.listaCamisetas.map(
          (c) =>
            `"${c.participanteNome}",${c.quantidade},"${c.tamanho}","${PAGAMENTO_CAMISETA_LABELS[c.pagamento]}"`
        ),
        "",
        "Resumo",
        `Total Participantes,${relatorio.totalParticipantes}`,
        `Total Pessoas,${relatorio.totalPessoas}`,
        `Total Crianças,${relatorio.totalCriancas}`,
        `Servidores,${relatorio.totalServidores}`,
        `Cash Inscrição,${relatorio.cashInscricao}`,
        `Venmo Inscrição,${relatorio.venmoInscricao}`,
        `Não Pagos Inscrição,${relatorio.naoPagosInscricao}`,
        `Free Inscrição,${relatorio.freeInscricao}`,
        "",
        "Financeiro",
        `Inscrição Dinheiro,${relatorio.valorDinheiroInscricao.toFixed(2)}`,
        `Inscrição Venmo,${relatorio.valorVenmoInscricao.toFixed(2)}`,
        `Total Inscrição,${relatorio.totalValorInscricao.toFixed(2)}`,
        `Camiseta Dinheiro,${relatorio.valorDinheiroCamiseta.toFixed(2)}`,
        `Camiseta Venmo,${relatorio.valorVenmoCamiseta.toFixed(2)}`,
        `Total Camiseta,${relatorio.totalValorCamiseta.toFixed(2)}`,
        `Total Dinheiro,${relatorio.totalDinheiro.toFixed(2)}`,
        `Total Venmo,${relatorio.totalVenmo.toFixed(2)}`,
        `Total Geral,${relatorio.totalGeral.toFixed(2)}`,
        "",
        "Camisetas por pagamento",
        `Pagas,${relatorio.camisetasPagas}`,
        `Não pagas,${relatorio.camisetasNaoPagas}`,
        `Free,${relatorio.camisetasFree}`,
        "",
        "Camisetas retirada",
        `Retiradas,${relatorio.camisetasRetiradas}`,
        `Pendentes,${relatorio.camisetasPendentes}`,
      ];

      return new Response(lines.join("\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="relatorio-${eventoId}.csv"`,
        },
      });
    }

    return apiSuccess(relatorio);
  } catch (error) {
    return handleApiError(error);
  }
}
