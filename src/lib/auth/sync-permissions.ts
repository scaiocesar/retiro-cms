import {
  FULL_PERMISSIONS,
  normalizePermissions,
  type UserPermissions,
} from "@/lib/auth/permissions";
import type { SessionData } from "@/lib/auth/session";
import { getUsuarioRepository } from "@/lib/repositories";

/**
 * Carrega permissões atuais do banco e atualiza a sessão se mudaram.
 * Evita precisar de logout/login após o admin alterar acessos.
 */
export async function syncSessionPermissions(
  session: SessionData & { save?: () => Promise<void> }
): Promise<UserPermissions> {
  if (!session.isLoggedIn || !session.userId) {
    return normalizePermissions(session.permissoes, session.role);
  }

  if (session.role === "ADMIN") {
    const full = { ...FULL_PERMISSIONS };
    session.permissoes = full;
    return full;
  }

  try {
    const user = await getUsuarioRepository().findById(session.userId);
    if (!user || !user.ativo) {
      return normalizePermissions(session.permissoes, session.role);
    }

    const permissoes = normalizePermissions(user.permissoes, user.role);
    const changed =
      session.role !== user.role ||
      JSON.stringify(session.permissoes) !== JSON.stringify(permissoes);

    session.role = user.role;
    session.permissoes = permissoes;
    session.nome = user.nome;
    session.username = user.username;

    if (changed && typeof session.save === "function") {
      await session.save();
    }

    return permissoes;
  } catch {
    return normalizePermissions(session.permissoes, session.role);
  }
}
