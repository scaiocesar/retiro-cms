import { ensureSeed } from "@/lib/db/seed";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getSession } from "@/lib/auth/helpers";

export async function GET() {
  await ensureSeed();
  const session = await getSession();
  if (!session.isLoggedIn) {
    return apiError("Não autenticado", 401);
  }
  return apiSuccess({
    userId: session.userId,
    username: session.username,
    nome: session.nome,
    role: session.role,
  });
}
