import { ensureSeed } from "@/lib/db/seed";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { requireAuth, requireMenuEdit } from "@/lib/auth/helpers";
import { ParticipanteService } from "@/lib/services";
import { normalizeSearchTerm } from "@/lib/search";
import {
  parseEhServidorFilter,
  parsePagamentoInscricaoFilter,
} from "@/lib/participante-filters";
import { participanteSchema } from "@/lib/validations/schemas";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await ensureSeed();
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const eventoId = searchParams.get("eventoId");
    const search = normalizeSearchTerm(searchParams.get("search") ?? "");
    const pagamentoInscricao = parsePagamentoInscricaoFilter(
      searchParams.get("pagamentoInscricao")
    );
    const ehServidor = parseEhServidorFilter(searchParams.get("ehServidor"));
    if (!eventoId) return apiError("eventoId obrigatório");

    const service = new ParticipanteService();
    const participantes = await service.list(eventoId, {
      search,
      pagamentoInscricao,
      ehServidor,
    });
    return apiSuccess(participantes);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeed();
    const session = await requireMenuEdit("participantes");
    const body = await request.json();
    const parsed = participanteSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const service = new ParticipanteService();
    const participante = await service.create(parsed.data, session.userId);
    return apiSuccess(participante, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
