import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { ensureSeed } from "@/lib/db/seed";
import { apiError } from "@/lib/api/response";
import {
  LOGIN_BLOCKED_MESSAGE,
  LOGIN_INVALID_MESSAGE,
} from "@/lib/auth/login-limits";
import { getClientIp, getUserAgent } from "@/lib/auth/request-meta";
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
    const result = await authService.login(
      parsed.data.username,
      parsed.data.senha,
      {
        ip: getClientIp(request),
        userAgent: getUserAgent(request),
      }
    );

    if (!result.ok) {
      if (result.reason === "blocked") {
        return apiError(LOGIN_BLOCKED_MESSAGE, 403);
      }
      if (result.remainingAttempts != null && result.remainingAttempts > 0) {
        return apiError(
          `${LOGIN_INVALID_MESSAGE}. Tentativas restantes: ${result.remainingAttempts}`,
          401
        );
      }
      return apiError(LOGIN_INVALID_MESSAGE, 401);
    }

    const response = NextResponse.json({
      data: {
        userId: result.user.userId,
        username: result.user.username,
        nome: result.user.nome,
        role: result.user.role,
      },
    });

    const session = await getIronSession<SessionData>(
      request,
      response,
      sessionOptions
    );
    session.userId = result.user.userId;
    session.username = result.user.username;
    session.nome = result.user.nome;
    session.role = result.user.role;
    session.permissoes = result.user.permissoes;
    session.isLoggedIn = true;
    await session.save();

    return response;
  } catch {
    return apiError("Erro ao fazer login", 500);
  }
}
