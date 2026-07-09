import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { ensureSeed } from "@/lib/db/seed";
import { apiError, apiSuccess } from "@/lib/api/response";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { AuthService } from "@/lib/services";
import { loginSchema } from "@/lib/validations/schemas";

export async function POST(request: NextRequest) {
  try {
    await ensureSeed();
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const authService = new AuthService();
    const user = await authService.login(parsed.data.username, parsed.data.senha);
    if (!user) {
      return apiError("Usuário ou senha inválidos", 401);
    }

    const response = NextResponse.json({
      data: {
        userId: user.userId,
        username: user.username,
        nome: user.nome,
        role: user.role,
      },
    });

    const session = await getIronSession<SessionData>(
      request,
      response,
      sessionOptions
    );
    session.userId = user.userId;
    session.username = user.username;
    session.nome = user.nome;
    session.role = user.role;
    session.isLoggedIn = true;
    await session.save();

    return response;
  } catch {
    return apiError("Erro ao fazer login", 500);
  }
}
