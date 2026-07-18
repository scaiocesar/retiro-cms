import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import {
  canAccess,
  canEdit,
  type MenuKey,
} from "@/lib/auth/permissions";
import {
  defaultSession,
  sessionOptions,
  type SessionData,
} from "@/lib/auth/session";
import { syncSessionPermissions } from "@/lib/auth/sync-permissions";

export async function getSession() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  if (!session.isLoggedIn) {
    return { ...defaultSession };
  }
  await syncSessionPermissions(session);
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

/** Require access to a menu (read or edit). */
export async function requireMenuAccess(menu: MenuKey) {
  const session = await requireAuth();
  if (!canAccess(session.role, session.permissoes, menu)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

/** Require edit permission on a menu. */
export async function requireMenuEdit(menu: MenuKey) {
  const session = await requireAuth();
  if (!canEdit(session.role, session.permissoes, menu)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export function isAdmin(role: string): boolean {
  return role === "ADMIN";
}
