import { ensureSeed } from "@/lib/db/seed";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { requireAdmin, requireAuth } from "@/lib/auth/helpers";
import { ParticipanteService } from "@/lib/services";
import { participanteSchema } from "@/lib/validations/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await ensureSeed();
    await requireAuth();
    const { id } = await context.params;
    const service = new ParticipanteService();
    const participante = await service.getById(id);
    return apiSuccess(participante);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await ensureSeed();
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = participanteSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const service = new ParticipanteService();
    const participante = await service.update(id, parsed.data);
    return apiSuccess(participante);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await ensureSeed();
    await requireAdmin();
    const { id } = await context.params;
    const service = new ParticipanteService();
    await service.delete(id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
