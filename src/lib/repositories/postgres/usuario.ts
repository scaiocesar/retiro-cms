import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { usuarios } from "@/lib/db/schema";
import type { UsuarioSistema, UsuarioSistemaPublic } from "@/lib/types";
import type { UsuarioSistemaInput } from "@/lib/validations/schemas";
import type { IUsuarioRepository } from "@/lib/repositories/interfaces";

function toPublic(user: UsuarioSistema): UsuarioSistemaPublic {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    ativo: user.ativo,
    criadoEm: user.criadoEm,
  };
}

function mapRow(row: typeof usuarios.$inferSelect): UsuarioSistema {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    senhaHash: row.senhaHash,
    role: row.role,
    ativo: row.ativo,
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

  async findByEmail(email: string): Promise<UsuarioSistema | null> {
    const [row] = await getDb()
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email.toLowerCase()))
      .limit(1);
    return row ? mapRow(row) : null;
  }

  async create(
    data: UsuarioSistemaInput & { senhaHash: string }
  ): Promise<UsuarioSistemaPublic> {
    const [row] = await getDb()
      .insert(usuarios)
      .values({
        nome: data.nome,
        email: data.email.toLowerCase(),
        senhaHash: data.senhaHash,
        role: data.role,
        ativo: data.ativo ?? true,
      })
      .returning();
    return toPublic(mapRow(row));
  }

  async update(
    id: string,
    data: Partial<UsuarioSistemaInput & { senhaHash?: string }>
  ): Promise<UsuarioSistemaPublic | null> {
    const [row] = await getDb()
      .update(usuarios)
      .set({
        nome: data.nome,
        email: data.email?.toLowerCase(),
        senhaHash: data.senhaHash,
        role: data.role,
        ativo: data.ativo,
      })
      .where(eq(usuarios.id, id))
      .returning();

    return row ? toPublic(mapRow(row)) : null;
  }
}
