"use server";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ensureSeed } from "@/lib/db/seed";
import { sessionOptions, type SessionData } from "@/lib/auth/session";
import { AuthService } from "@/lib/services";
import { loginSchema } from "@/lib/validations/schemas";

export type LoginState = {
  error?: string;
};

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
  const user = await authService.login(parsed.data.username, parsed.data.senha);

  if (!user) {
    return { error: "Usuário ou senha inválidos" };
  }

  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  session.userId = user.userId;
  session.username = user.username;
  session.nome = user.nome;
  session.role = user.role;
  session.isLoggedIn = true;
  await session.save();

  const from = (formData.get("from") as string) || "/";
  redirect(from.startsWith("/") ? from : "/");
}
