import { ensureSeed } from "@/lib/db/seed";
import { handleApiError } from "@/lib/api/response";
import { requireMenuAccess } from "@/lib/auth/helpers";
import { generateParticipantesPdf } from "@/lib/participantes-export";
import { EventoService, ParticipanteService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await ensureSeed();
    await requireMenuAccess("participantes");

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

    const participanteService = new ParticipanteService();
    const participantes = await participanteService.list(eventoId);

    const pdf = generateParticipantesPdf(participantes, evento.nome, evento.data);
    const filename = `participantes-${eventoId}.pdf`;

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
