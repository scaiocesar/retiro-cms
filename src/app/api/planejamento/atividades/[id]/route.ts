import { ensureSeed } from "@/lib/db/seed";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/helpers";
import { PlanejamentoService } from "@/lib/services";
import { planejamentoAtividadeUpdateSchema } from "@/lib/validations/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeed();
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const parsed = planejamentoAtividadeUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    if (Object.keys(parsed.data).length === 0) {
      return apiError("Nenhum campo para atualizar");
    }
    const service = new PlanejamentoService();
    const dia = await service.updateAtividade(id, parsed.data);
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
    await requireAuth();
    const { id } = await params;
    const service = new PlanejamentoService();
    const dia = await service.deleteAtividade(id);
    return apiSuccess(dia);
  } catch (error) {
    return handleApiError(error);
  }
}
