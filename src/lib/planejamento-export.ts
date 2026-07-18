import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  formatDuracao,
  formatMinutesToDisplay,
  parseHorarioToMinutes,
} from "@/lib/planejamento/horarios";
import { formatDate } from "@/lib/utils";
import type { PlanejamentoDiaCompleto } from "@/lib/types";

function displayHorario(hhmm: string): string {
  try {
    return formatMinutesToDisplay(parseHorarioToMinutes(hhmm));
  } catch {
    return hhmm;
  }
}

export function generatePlanejamentoPdf(
  dias: PlanejamentoDiaCompleto[],
  eventoNome: string,
  eventoData: string
): ArrayBuffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const generatedAt = formatDate(new Date());
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(14);
  doc.text("Cronograma do retiro", 14, 14);
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`${eventoNome} — ${formatDate(eventoData)}`, 14, 20);
  doc.text(`Gerado em ${generatedAt}`, 14, 25);
  doc.setTextColor(0);

  let startY = 32;

  for (const dia of dias) {
    if (startY > 250) {
      doc.addPage();
      startY = 14;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const diaTitle = `${dia.nome} · Início ${displayHorario(dia.horarioInicio)}`;
    const termino = dia.horarioTermino
      ? ` · Término ${displayHorario(dia.horarioTermino)}`
      : "";
    doc.text(diaTitle + termino, 14, startY);
    doc.setFont("helvetica", "normal");

    const body =
      dia.atividades.length > 0
        ? dia.atividades.map((a) => [
            formatDuracao(a.duracaoMinutos),
            displayHorario(a.horarioInicio),
            a.descricao,
            a.responsavel?.trim() || "—",
          ])
        : [["—", "—", "Nenhuma atividade cadastrada", "—"]];

    autoTable(doc, {
      startY: startY + 4,
      head: [["Duração", "Horário", "Descrição", "Responsável"]],
      body,
      styles: {
        fontSize: 9,
        cellPadding: 2.5,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [30, 41, 59],
        fontSize: 9,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
      },
      columnStyles: {
        0: { cellWidth: 22, halign: "center" },
        1: { cellWidth: 28, halign: "center" },
        2: { cellWidth: 80 },
        3: { cellWidth: 46 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" }
        );
        doc.setTextColor(0);
      },
    });

    const lastTable = (
      doc as unknown as {
        lastAutoTable?: { finalY: number };
      }
    ).lastAutoTable;
    startY = (lastTable?.finalY ?? startY) + 12;
  }

  return doc.output("arraybuffer");
}
