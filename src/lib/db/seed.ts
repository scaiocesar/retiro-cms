import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { isBuildTime } from "@/lib/db/runtime";
import { runMigrations } from "@/lib/db/migrate";
import { usuarios } from "@/lib/db/schema";
import { getUsuarioRepository } from "@/lib/repositories";
import type { UsuarioSistema } from "@/lib/types";

export async function recreateAdminUser(): Promise<UsuarioSistema> {
  const repo = getUsuarioRepository();
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@retiro.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const senhaHash = await bcrypt.hash(adminPassword, 10);
  const recreate = process.env.RECREATE_ADMIN_ON_START === "true";

  const existing = await repo.findByEmail(adminEmail);
  if (existing) {
    if (recreate) {
      await repo.update(existing.id, { senhaHash });
      return { ...existing, senhaHash };
    }
    return existing;
  }

  const [inserted] = await getDb()
    .insert(usuarios)
    .values({
      nome: "Administrador",
      email: adminEmail,
      senhaHash,
      role: "ADMIN",
      ativo: true,
    })
    .onConflictDoNothing({ target: usuarios.email })
    .returning();

  if (inserted) {
    return {
      id: inserted.id,
      nome: inserted.nome,
      email: inserted.email,
      senhaHash: inserted.senhaHash,
      role: inserted.role,
      ativo: inserted.ativo,
      criadoEm: inserted.criadoEm,
    };
  }

  const created = await repo.findByEmail(adminEmail);
  if (!created) {
    throw new Error("Falha ao criar usuário administrador");
  }

  if (recreate) {
    await repo.update(created.id, { senhaHash });
    return { ...created, senhaHash };
  }

  return created;
}

export async function seedDatabase(): Promise<void> {
  await recreateAdminUser();
}

export async function ensureSeed(): Promise<void> {
  if (isBuildTime() || !process.env.DATABASE_URL) {
    return;
  }
  await runMigrations();
  await seedDatabase();
}
