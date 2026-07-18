import { ensureSeed } from "@/lib/db/seed";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/helpers";
import { PlanejamentoService } from "@/lib/services";
import { planejamentoAtividadeSchema } from "@/lib/validations/schemas";

export async function POST(request: Request) {
  try {
    await ensureSeed();
    await requireAuth();
    const body = await request.json();
    const parsed = planejamentoAtividadeSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const service = new PlanejamentoService();
    const dia = await service.createAtividade(parsed.data);
    return apiSuccess(dia, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
