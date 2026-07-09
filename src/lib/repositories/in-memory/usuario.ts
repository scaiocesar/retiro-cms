import { v4 as uuidv4 } from "uuid";
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
      criadoEm: new Date().toISOString(),
    };
    getStore().usuarios.set(user.id, user);
    return toPublic(user);
  }

  async update(
    id: string,
    data: Partial<UsuarioSistemaInput & { senhaHash?: string }>
  ): Promise<UsuarioSistemaPublic | null> {
    const store = getStore();
    const existing = store.usuarios.get(id);
    if (!existing) return null;

    const updated: UsuarioSistema = {
      ...existing,
      nome: data.nome ?? existing.nome,
      username: data.username?.toLowerCase() ?? existing.username,
      senhaHash: data.senhaHash ?? existing.senhaHash,
      role: data.role ?? existing.role,
      ativo: data.ativo ?? existing.ativo,
    };
    store.usuarios.set(id, updated);
    return toPublic(updated);
  }
}
