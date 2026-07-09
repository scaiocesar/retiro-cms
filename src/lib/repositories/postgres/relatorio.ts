import { PostgresEventoRepository } from "@/lib/repositories/postgres/evento";
import { PostgresParticipanteRepository } from "@/lib/repositories/postgres/participante";
import type { IRelatorioRepository } from "@/lib/repositories/interfaces";
import { calcularResumoFinanceiro } from "@/lib/financeiro";
import type { RelatorioEvento } from "@/lib/types";
import { TAMANHO_CAMISETA_LABELS } from "@/lib/types";

export class PostgresRelatorioRepository implements IRelatorioRepository {
  private participanteRepo = new PostgresParticipanteRepository();
  private eventoRepo = new PostgresEventoRepository();

  async gerar(eventoId: string): Promise<RelatorioEvento | null> {
    const evento = await this.eventoRepo.findById(eventoId);
    if (!evento) return null;

    const participantes = await this.participanteRepo.findByEvento(eventoId);

    const camisetasPorTamanho: Record<string, number> = {};
    const listaCamisetas: RelatorioEvento["listaCamisetas"] = [];

    let totalCriancas = 0;
    let totalServidores = 0;
    let totalPresentes = 0;
    let cashInscricao = 0;
    let venmoInscricao = 0;
    let naoPagosInscricao = 0;
    let freeInscricao = 0;
    let camisetasPagas = 0;
    let camisetasNaoPagas = 0;
    let camisetasFree = 0;

    for (const p of participantes) {
      if (p.ehServidor) totalServidores++;
      if (p.checkin) totalPresentes++;
      if (p.pagamentoInscricao === "NAO") {
        naoPagosInscricao++;
      } else if (p.pagamentoInscricao === "FREE") {
        freeInscricao++;
      } else if (p.pagamentoInscricao === "CASH") {
        cashInscricao++;
      } else if (p.pagamentoInscricao === "VENMO") {
        venmoInscricao++;
      }
      totalCriancas += p.criancas.length;

      for (const c of p.camisetas) {
        const qty = c.quantidade;
        if (c.pagamento === "NAO") {
          camisetasNaoPagas += qty;
        } else if (c.pagamento === "FREE") {
          camisetasFree += qty;
        } else if (c.pagamento === "CASH" || c.pagamento === "VENMO") {
          camisetasPagas += qty;
        }

        const tamanhoLabel =
          c.tamanho === "TODDLER" && c.idadeToddler
            ? `Toddler (${c.idadeToddler})`
            : TAMANHO_CAMISETA_LABELS[c.tamanho];

        camisetasPorTamanho[tamanhoLabel] =
          (camisetasPorTamanho[tamanhoLabel] ?? 0) + c.quantidade;

        listaCamisetas.push({
          participanteNome: p.nome,
          quantidade: c.quantidade,
          tamanho: tamanhoLabel,
          idadeToddler: c.idadeToddler,
          pagamento: c.pagamento,
        });
      }
    }

    const financeiro = calcularResumoFinanceiro(participantes);

    return {
      eventoId,
      totalParticipantes: participantes.length,
      totalParticipantesNaoServidores: participantes.length - totalServidores,
      totalCriancas,
      totalServidores,
      totalPresentes,
      totalNaoPresentes: participantes.length - totalPresentes,
      cashInscricao,
      venmoInscricao,
      naoPagosInscricao,
      freeInscricao,
      ...financeiro,
      camisetasPagas,
      camisetasNaoPagas,
      camisetasFree,
      camisetasPorTamanho,
      listaCamisetas,
    };
  }
}
