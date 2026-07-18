import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { usuarios } from "@/lib/db/schema";
import { MAX_FAILED_LOGINS } from "@/lib/auth/login-limits";
import {
  parsePermissionsJson,
  serializePermissions,
  type UserPermissions,
} from "@/lib/auth/permissions";
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

function mapRow(row: typeof usuarios.$inferSelect): UsuarioSistema {
  return {
    id: row.id,
    nome: row.nome,
    username: row.username,
    senhaHash: row.senhaHash,
    role: row.role,
    ativo: row.ativo,
    tentativasLogin: row.tentativasLogin,
    permissoes: parsePermissionsJson(row.permissoes, row.role),
    criadoEm: row.criadoEm,
  };
}

export class PostgresUsuarioRepository implements IUsuarioRepository {
  async findAll(): Promise<UsuarioSistemaPublic[]> {
    const rows = await getDb().select().from(usuarios).orderBy(usuarios.nome);
    return rows.map((row) => toPublic(mapRow(row)));
  }

  async findById(id: string): Promise<UsuarioSistema | null> {
    const [row] = await getDb().select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
    return row ? mapRow(row) : null;
  }

  async findByUsername(username: string): Promise<UsuarioSistema | null> {
    const [row] = await getDb()
      .select()
      .from(usuarios)
      .where(eq(usuarios.username, username.toLowerCase()))
      .limit(1);
    return row ? mapRow(row) : null;
  }

  async create(
    data: UsuarioSistemaInput & { senhaHash: string }
  ): Promise<UsuarioSistemaPublic> {
    const permissoes: UserPermissions | undefined =
      data.role === "ADMIN" ? undefined : data.permissoes;

    const [row] = await getDb()
      .insert(usuarios)
      .values({
        nome: data.nome,
        username: data.username,
        senhaHash: data.senhaHash,
        role: data.role,
        ativo: data.ativo ?? true,
        tentativasLogin: 0,
        permissoes: permissoes ? serializePermissions(permissoes) : null,
      })
      .returning();
    return toPublic(mapRow(row));
  }

  async update(
    id: string,
    data: Partial<
      UsuarioSistemaInput & { senhaHash?: string; tentativasLogin?: number }
    >
  ): Promise<UsuarioSistemaPublic | null> {
    const patch: Partial<{
      nome: string;
      username: string;
      senhaHash: string;
      role: UsuarioSistemaInput["role"];
      ativo: boolean;
      tentativasLogin: number;
      permissoes: string | null;
    }> = {};
    if (data.nome !== undefined) patch.nome = data.nome;
    if (data.username !== undefined) patch.username = data.username;
    if (data.senhaHash !== undefined) patch.senhaHash = data.senhaHash;
    if (data.role !== undefined) patch.role = data.role;
    if (data.ativo !== undefined) patch.ativo = data.ativo;
    if (data.tentativasLogin !== undefined) patch.tentativasLogin = data.tentativasLogin;
    if (data.permissoes !== undefined) {
      patch.permissoes =
        (data.role ?? undefined) === "ADMIN"
          ? null
          : serializePermissions(data.permissoes);
    }
    if (data.role === "ADMIN") {
      patch.permissoes = null;
    }

    if (Object.keys(patch).length === 0) {
      const existing = await this.findById(id);
      return existing ? toPublic(existing) : null;
    }

    const [row] = await getDb()
      .update(usuarios)
      .set(patch)
      .where(eq(usuarios.id, id))
      .returning();

    return row ? toPublic(mapRow(row)) : null;
  }

  async registerFailedLogin(id: string): Promise<UsuarioSistema | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const tentativasLogin = existing.tentativasLogin + 1;
    const ativo = tentativasLogin <= MAX_FAILED_LOGINS;

    const [row] = await getDb()
      .update(usuarios)
      .set({
        tentativasLogin,
        ativo,
      })
      .where(eq(usuarios.id, id))
      .returning();

    return row ? mapRow(row) : null;
  }

  async resetLoginAttempts(id: string): Promise<void> {
    await getDb()
      .update(usuarios)
      .set({ tentativasLogin: 0 })
      .where(eq(usuarios.id, id));
  }
}
