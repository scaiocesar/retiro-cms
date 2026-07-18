import { v4 as uuidv4 } from "uuid";
import { MAX_FAILED_LOGINS } from "@/lib/auth/login-limits";
import {
  DEFAULT_USUARIO_PERMISSIONS,
  FULL_PERMISSIONS,
  normalizePermissions,
} from "@/lib/auth/permissions";
import { getStore } from "@/lib/db/in-memory-store";
import type { UsuarioSistema, UsuarioSistemaPublic } from "@/lib/types";
import type { UsuarioSistemaInput } from "@/lib/validations/schemas";
import type { IUsuarioRepository } from "@/lib/repositories/interfaces";

function toPublic(user: UsuarioSistema): UsuarioSistemaPublic {
  return {
    id: user.id,
    nome: user.nome,
    username: user.username,
    role: user.role,
    ativo: user.ativo,
    permissoes: user.permissoes,
    criadoEm: user.criadoEm,
  };
}

export class InMemoryUsuarioRepository implements IUsuarioRepository {
  async findAll(): Promise<UsuarioSistemaPublic[]> {
    return Array.from(getStore().usuarios.values())
      .map(toPublic)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  async findById(id: string): Promise<UsuarioSistema | null> {
    return getStore().usuarios.get(id) ?? null;
  }

  async findByUsername(username: string): Promise<UsuarioSistema | null> {
    const users = Array.from(getStore().usuarios.values());
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase()) ?? null;
  }

  async create(
    data: UsuarioSistemaInput & { senhaHash: string }
  ): Promise<UsuarioSistemaPublic> {
    const user: UsuarioSistema = {
      id: uuidv4(),
      nome: data.nome,
      username: data.username.toLowerCase(),
      senhaHash: data.senhaHash,
      role: data.role,
      ativo: data.ativo ?? true,
      tentativasLogin: 0,
      permissoes:
        data.role === "ADMIN"
          ? { ...FULL_PERMISSIONS }
          : normalizePermissions(data.permissoes ?? DEFAULT_USUARIO_PERMISSIONS),
      criadoEm: new Date().toISOString(),
    };
    getStore().usuarios.set(user.id, user);
    return toPublic(user);
  }

  async update(
    id: string,
    data: Partial<UsuarioSistemaInput & { senhaHash?: string; tentativasLogin?: number }>
  ): Promise<UsuarioSistemaPublic | null> {
    const store = getStore();
    const existing = store.usuarios.get(id);
    if (!existing) return null;

    const role = data.role ?? existing.role;
    const updated: UsuarioSistema = {
      ...existing,
      nome: data.nome ?? existing.nome,
      username: data.username?.toLowerCase() ?? existing.username,
      senhaHash: data.senhaHash ?? existing.senhaHash,
      role,
      ativo: data.ativo ?? existing.ativo,
      tentativasLogin:
        data.tentativasLogin !== undefined
          ? data.tentativasLogin
          : existing.tentativasLogin,
      permissoes:
        role === "ADMIN"
          ? { ...FULL_PERMISSIONS }
          : data.permissoes
            ? normalizePermissions(data.permissoes)
            : existing.permissoes,
    };
    store.usuarios.set(id, updated);
    return toPublic(updated);
  }

  async registerFailedLogin(id: string): Promise<UsuarioSistema | null> {
    const store = getStore();
    const existing = store.usuarios.get(id);
    if (!existing) return null;

    const tentativasLogin = existing.tentativasLogin + 1;
    const updated: UsuarioSistema = {
      ...existing,
      tentativasLogin,
      ativo: tentativasLogin <= MAX_FAILED_LOGINS,
    };
    store.usuarios.set(id, updated);
    return updated;
  }

  async resetLoginAttempts(id: string): Promise<void> {
    const store = getStore();
    const existing = store.usuarios.get(id);
    if (!existing) return;
    store.usuarios.set(id, { ...existing, tentativasLogin: 0 });
  }
}
