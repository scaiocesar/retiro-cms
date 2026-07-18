import { ensureSeed } from "@/lib/db/seed";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { requireMenuEdit } from "@/lib/auth/helpers";
import { ParticipanteService } from "@/lib/services";
import { retiradaSchema } from "@/lib/validations/retirada";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await ensureSeed();
    await requireMenuEdit("retirada");
    const { id } = await context.params;
    const body = await request.json();
    const parsed = retiradaSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const service = new ParticipanteService();
    const participante = await service.setCamisetaRetirada(id, parsed.data.retirada);
    return apiSuccess(participante);
  } catch (error) {
    return handleApiError(error);
  }
}
