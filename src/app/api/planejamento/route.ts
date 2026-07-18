import { cookies } from "next/headers";
import { ensureSeed } from "@/lib/db/seed";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { requireMenuAccess } from "@/lib/auth/helpers";
import { EVENTO_COOKIE } from "@/lib/auth/session";
import { PlanejamentoService } from "@/lib/services";

export async function GET(request: Request) {
  try {
    await ensureSeed();
    await requireMenuAccess("planejamento");
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const eventoId =
      searchParams.get("eventoId") ?? cookieStore.get(EVENTO_COOKIE)?.value;
    if (!eventoId) {
      return apiError("Selecione um retiro ativo", 400);
    }
    const service = new PlanejamentoService();
    const dias = await service.listByEvento(eventoId);
    return apiSuccess(dias);
  } catch (error) {
    return handleApiError(error);
  }
}
