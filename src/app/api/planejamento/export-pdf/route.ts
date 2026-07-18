import { ensureSeed } from "@/lib/db/seed";
import { handleApiError } from "@/lib/api/response";
import { requireMenuAccess } from "@/lib/auth/helpers";
import { generatePlanejamentoPdf } from "@/lib/planejamento-export";
import { EventoService, PlanejamentoService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await ensureSeed();
    await requireMenuAccess("planejamento");

    const { searchParams } = new URL(request.url);
    const eventoId = searchParams.get("eventoId");
    if (!eventoId) {
      return new Response("eventoId obrigatório", { status: 400 });
    }

    const eventoService = new EventoService();
    const evento = await eventoService.getById(eventoId);
    if (!evento) {
      return new Response("Evento não encontrado", { status: 404 });
    }

    const planejamentoService = new PlanejamentoService();
    const dias = await planejamentoService.listByEvento(eventoId);

    if (dias.length === 0) {
      return new Response("Nenhum dia cadastrado no planejamento", {
        status: 400,
      });
    }

    const pdf = generatePlanejamentoPdf(dias, evento.nome, evento.data);
    const filename = `cronograma-${eventoId}.pdf`;

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
