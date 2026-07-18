"use server";

import { getIronSession } from "iron-session";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ensureSeed } from "@/lib/db/seed";
import {
  LOGIN_BLOCKED_MESSAGE,
  LOGIN_INVALID_MESSAGE,
} from "@/lib/auth/login-limits";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { AuthService } from "@/lib/services";
import { loginSchema } from "@/lib/validations/schemas";

export type LoginState = {
  error?: string;
};

async function getLoginMeta() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    null;
  const userAgent = h.get("user-agent")?.slice(0, 500) || null;
  return { ip, userAgent };
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  await ensureSeed();

  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const authService = new AuthService();
  const meta = await getLoginMeta();
  const result = await authService.login(
    parsed.data.username,
    parsed.data.senha,
    meta
  );

  if (!result.ok) {
    if (result.reason === "blocked") {
      return { error: LOGIN_BLOCKED_MESSAGE };
    }
    if (result.remainingAttempts != null && result.remainingAttempts > 0) {
      return {
        error: `${LOGIN_INVALID_MESSAGE}. Tentativas restantes: ${result.remainingAttempts}`,
      };
    }
    return { error: LOGIN_INVALID_MESSAGE };
  }

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  session.userId = result.user.userId;
  session.username = result.user.username;
  session.nome = result.user.nome;
  session.role = result.user.role;
  session.permissoes = result.user.permissoes;
  session.isLoggedIn = true;
  await session.save();

  const from = (formData.get("from") as string) || "/";
  redirect(from.startsWith("/") ? from : "/");
}
