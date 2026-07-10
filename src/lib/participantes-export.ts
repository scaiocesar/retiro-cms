import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatPhone } from "@/lib/phone-mask";
import { formatDate } from "@/lib/utils";
import {
  PAGAMENTO_CRIANCA_LABELS,
  PAGAMENTO_INSCRICAO_LABELS,
  TAMANHO_CAMISETA_LABELS,
  type Camiseta,
  type Crianca,
  type ParticipanteCompleto,
} from "@/lib/types";

function formatTamanho(c: Camiseta): string {
  if (c.tamanho === "TODDLER" && c.idadeToddler) {
    return `Toddler (${c.idadeToddler})`;
  }
  return TAMANHO_CAMISETA_LABELS[c.tamanho];
}

function formatCamisetas(p: ParticipanteCompleto): string {
  if (p.camisetas.length === 0) return "—";

  return p.camisetas
    .map((c) => {
      const tamanho = formatTamanho(c);
      const qtd = c.quantidade > 1 ? ` x${c.quantidade}` : "";
      const retirada = c.retirada ? " [retirada]" : "";
      return `${tamanho}${qtd}${retirada}`;
    })
    .join("; ");
}

function formatCriancas(criancas: Crianca[]): string {
  if (criancas.length === 0) return "—";

  return criancas
    .map((c) => {
      const pagamento = PAGAMENTO_CRIANCA_LABELS[c.pagamento];
      return `${c.nome} (${c.idade}a) — ${pagamento}`;
    })
    .join("; ");
}

function participanteToRow(p: ParticipanteCompleto, index: number): string[] {
  return [
    String(index + 1),
    p.nome,
    formatPhone(p.telefone),
    PAGAMENTO_INSCRICAO_LABELS[p.pagamentoInscricao],
    formatCamisetas(p),
    formatCriancas(p.criancas),
    p.observacoes?.trim() || "—",
  ];
}

export function generateParticipantesPdf(
  participantes: ParticipanteCompleto[],
  eventoNome: string,
  eventoData: string
): ArrayBuffer {
  const sorted = [...participantes].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
  );

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const generatedAt = formatDate(new Date());

  doc.setFontSize(14);
  doc.text("Lista de participantes", 14, 14);
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`${eventoNome} — ${formatDate(eventoData)}`, 14, 20);
  doc.text(
    `Gerado em ${generatedAt} · ${sorted.length} participante(s) · Ordem alfabética`,
    14,
    25
  );
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 30,
    head: [
      [
        "Posição",
        "Nome",
        "Telefone",
        "Tipo pagamento",
        "Camisetas",
        "Crianças",
        "Obs",
      ],
    ],
    body: sorted.map((p, i) => participanteToRow(p, i)),
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: {
      fillColor: [30, 41, 59],
      fontSize: 8,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 14, halign: "center" },
      1: { cellWidth: 36 },
      2: { cellWidth: 28 },
      3: { cellWidth: 24 },
      4: { cellWidth: 48 },
      5: { cellWidth: 52 },
      6: { cellWidth: 40 },
    },
    margin: { left: 10, right: 10 },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: "center" }
      );
      doc.setTextColor(0);
    },
  });

  return doc.output("arraybuffer");
}
