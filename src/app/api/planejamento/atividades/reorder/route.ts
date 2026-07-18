import { ensureSeed } from "@/lib/db/seed";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { requireMenuEdit } from "@/lib/auth/helpers";
import { PlanejamentoService } from "@/lib/services";
import { planejamentoReorderSchema } from "@/lib/validations/schemas";

export async function PUT(request: Request) {
  try {
    await ensureSeed();
    await requireMenuEdit("planejamento");
    const body = await request.json();
    const parsed = planejamentoReorderSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const service = new PlanejamentoService();
    const dia = await service.reorderAtividades(
      parsed.data.diaId,
      parsed.data.orderedIds
    );
    return apiSuccess(dia);
  } catch (error) {
    return handleApiError(error);
  }
}
