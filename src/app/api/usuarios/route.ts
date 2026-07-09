import { ensureSeed } from "@/lib/db/seed";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/helpers";
import { UsuarioService } from "@/lib/services";
import { usuarioSistemaSchema } from "@/lib/validations/schemas";

export async function GET() {
  try {
    await ensureSeed();
    await requireAdmin();
    const service = new UsuarioService();
    const usuarios = await service.list();
    return apiSuccess(usuarios);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeed();
    await requireAdmin();
    const body = await request.json();
    const parsed = usuarioSistemaSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const service = new UsuarioService();
    const usuario = await service.create(parsed.data);
    return apiSuccess(usuario, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureSeed();
    await requireAdmin();
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return apiError("ID obrigatório");

    const parsed = usuarioSistemaSchema.partial().safeParse(data);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const service = new UsuarioService();
    const usuario = await service.update(id, parsed.data);
    return apiSuccess(usuario);
  } catch (error) {
    return handleApiError(error);
  }
}
