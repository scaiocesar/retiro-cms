import { ensureSeed } from "@/lib/db/seed";
import { apiSuccess, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/helpers";
import { LoginHistoricoService } from "@/lib/services";

export async function GET(request: Request) {
  try {
    await ensureSeed();
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuarioId");
    const limitParam = Number(searchParams.get("limit") ?? "100");
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 500)
      : 100;

    const service = new LoginHistoricoService();
    const entries = usuarioId
      ? await service.listByUsuario(usuarioId, limit)
      : await service.list(limit);

    return apiSuccess(entries);
  } catch (error) {
    return handleApiError(error);
  }
}
