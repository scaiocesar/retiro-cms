import { InMemoryEventoRepository } from "@/lib/repositories/in-memory/evento";
import { InMemoryParticipanteRepository } from "@/lib/repositories/in-memory/participante";
import type { IRelatorioRepository } from "@/lib/repositories/interfaces";
import type { RelatorioEvento } from "@/lib/types";
import { TAMANHO_CAMISETA_LABELS } from "@/lib/types";

export class InMemoryRelatorioRepository implements IRelatorioRepository {
  private participanteRepo = new InMemoryParticipanteRepository();
  private eventoRepo = new InMemoryEventoRepository();

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
    let doacaoInscricao = 0;

    for (const p of participantes) {
      if (p.ehServidor) totalServidores++;
      if (p.checkin) totalPresentes++;
      if (p.pagamentoInscricao === "NAO") {
        naoPagosInscricao++;
      } else if (p.pagamentoInscricao === "DOACAO") {
        doacaoInscricao++;
      } else if (p.pagamentoInscricao === "CASH") {
        cashInscricao++;
      } else if (p.pagamentoInscricao === "VENMO") {
        venmoInscricao++;
      }
      totalCriancas += p.criancas.length;

      for (const c of p.camisetas) {
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
      doacaoInscricao,
      camisetasPorTamanho,
      listaCamisetas,
    };
  }
}
