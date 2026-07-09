import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getStore } from "@/lib/db/in-memory-store";
import type { UsuarioSistema } from "@/lib/types";

export async function seedDatabase(): Promise<void> {
  const store = getStore();
  if (store.seeded) return;

  await recreateAdminUser();
  store.seeded = true;
}

export async function recreateAdminUser(): Promise<UsuarioSistema> {
  const store = getStore();
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@retiro.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  for (const [id, user] of store.usuarios.entries()) {
    if (user.email.toLowerCase() === adminEmail) {
      store.usuarios.delete(id);
    }
  }

  const senhaHash = await bcrypt.hash(adminPassword, 10);
  const admin: UsuarioSistema = {
    id: uuidv4(),
    nome: "Administrador",
    email: adminEmail,
    senhaHash,
    role: "ADMIN",
    ativo: true,
    criadoEm: new Date().toISOString(),
  };
  store.usuarios.set(admin.id, admin);
  return admin;
}

export async function ensureSeed(): Promise<void> {
  await seedDatabase();
}
