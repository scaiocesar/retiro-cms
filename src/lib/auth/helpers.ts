import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import {
  defaultSession,
  sessionOptions,
  type SessionData,
} from "@/lib/auth/session";

export async function getSession() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  if (!session.isLoggedIn) {
    return { ...defaultSession };
  }
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

export function isAdmin(role: string): boolean {
  return role === "ADMIN";
}
