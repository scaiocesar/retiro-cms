import { cookies } from "next/headers";
import { ensureSeed } from "@/lib/db/seed";
import { apiError, apiSuccess, handleApiError } from "@/lib/api/response";
import { requireAdmin, requireAuth } from "@/lib/auth/helpers";
import { EVENTO_COOKIE } from "@/lib/auth/session";
import { getCookieSecure } from "@/lib/auth/cookie-options";
import { EventoService } from "@/lib/services";
import { eventoSchema } from "@/lib/validations/schemas";

export async function GET(request: Request) {
  try {
    await ensureSeed();
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const apenasAtivos = searchParams.get("ativos") === "true";
    const service = new EventoService();
    const eventos = await service.list(!apenasAtivos);
    return apiSuccess(eventos);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeed();
    await requireAdmin();
    const body = await request.json();
    const parsed = eventoSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const service = new EventoService();
    const evento = await service.create(parsed.data);
    return apiSuccess(evento, 201);
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
    const parsed = eventoSchema.partial().safeParse(data);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const service = new EventoService();
    const evento = await service.update(id, parsed.data);
    return apiSuccess(evento);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await ensureSeed();
    await requireAuth();
    const body = await request.json();
    const { eventoId } = body;
    if (!eventoId) return apiError("eventoId obrigatório");

    const service = new EventoService();
    const evento = await service.getById(eventoId);
    if (!evento || !evento.ativo) {
      return apiError("Evento não encontrado ou inativo");
    }

    const cookieStore = await cookies();
    cookieStore.set(EVENTO_COOKIE, eventoId, {
      httpOnly: true,
      secure: getCookieSecure(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return apiSuccess(evento);
  } catch (error) {
    return handleApiError(error);
  }
}
