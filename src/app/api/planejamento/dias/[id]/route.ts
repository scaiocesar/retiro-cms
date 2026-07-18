import { ensureSeed } from "@/lib/db/seed";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { requireMenuEdit } from "@/lib/auth/helpers";
import { PlanejamentoService } from "@/lib/services";
import { planejamentoDiaUpdateSchema } from "@/lib/validations/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeed();
    await requireMenuEdit("planejamento");
    const { id } = await params;
    const body = await request.json();
    const parsed = planejamentoDiaUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    if (Object.keys(parsed.data).length === 0) {
      return apiError("Nenhum campo para atualizar");
    }
    const service = new PlanejamentoService();
    const dia = await service.updateDia(id, parsed.data);
    return apiSuccess(dia);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeed();
    await requireMenuEdit("planejamento");
    const { id } = await params;
    const service = new PlanejamentoService();
    await service.deleteDia(id);
    return apiSuccess({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
