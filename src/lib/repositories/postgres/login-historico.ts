import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { loginHistorico, usuarios } from "@/lib/db/schema";
import type { LoginHistoricoEntry, LoginResultado } from "@/lib/types";
import type { ILoginHistoricoRepository } from "@/lib/repositories/interfaces";

function mapRow(row: {
  id: string;
  usuarioId: string | null;
  username: string;
  resultado: LoginResultado;
  ip: string | null;
  userAgent: string | null;
  criadoEm: string;
  usuarioNome?: string | null;
}): LoginHistoricoEntry {
  return {
    id: row.id,
    usuarioId: row.usuarioId ?? undefined,
    username: row.username,
    resultado: row.resultado,
    ip: row.ip ?? undefined,
    userAgent: row.userAgent ?? undefined,
    criadoEm: row.criadoEm,
    usuarioNome: row.usuarioNome ?? undefined,
  };
}

export class PostgresLoginHistoricoRepository
  implements ILoginHistoricoRepository
{
  async create(data: {
    usuarioId?: string | null;
    username: string;
    resultado: LoginResultado;
    ip?: string | null;
    userAgent?: string | null;
  }): Promise<LoginHistoricoEntry> {
    const [row] = await getDb()
      .insert(loginHistorico)
      .values({
        usuarioId: data.usuarioId ?? null,
        username: data.username.toLowerCase(),
        resultado: data.resultado,
        ip: data.ip ?? null,
        userAgent: data.userAgent ?? null,
      })
      .returning();
    return mapRow(row);
  }

  async list(limit = 100): Promise<LoginHistoricoEntry[]> {
    const rows = await getDb()
      .select({
        id: loginHistorico.id,
        usuarioId: loginHistorico.usuarioId,
        username: loginHistorico.username,
        resultado: loginHistorico.resultado,
        ip: loginHistorico.ip,
        userAgent: loginHistorico.userAgent,
        criadoEm: loginHistorico.criadoEm,
        usuarioNome: usuarios.nome,
      })
      .from(loginHistorico)
      .leftJoin(usuarios, eq(loginHistorico.usuarioId, usuarios.id))
      .orderBy(desc(loginHistorico.criadoEm))
      .limit(limit);

    return rows.map(mapRow);
  }

  async listByUsuario(
    usuarioId: string,
    limit = 50
  ): Promise<LoginHistoricoEntry[]> {
    const rows = await getDb()
      .select({
        id: loginHistorico.id,
        usuarioId: loginHistorico.usuarioId,
        username: loginHistorico.username,
        resultado: loginHistorico.resultado,
        ip: loginHistorico.ip,
        userAgent: loginHistorico.userAgent,
        criadoEm: loginHistorico.criadoEm,
        usuarioNome: usuarios.nome,
      })
      .from(loginHistorico)
      .leftJoin(usuarios, eq(loginHistorico.usuarioId, usuarios.id))
      .where(eq(loginHistorico.usuarioId, usuarioId))
      .orderBy(desc(loginHistorico.criadoEm))
      .limit(limit);

    return rows.map(mapRow);
  }
}
