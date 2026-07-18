import type { SessionOptions } from "iron-session";
import { getCookieSecure } from "@/lib/auth/cookie-options";
import type { UserPermissions } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/types";

export interface SessionData {
  userId: string;
  username: string;
  nome: string;
  role: UserRole;
  permissoes: UserPermissions;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  userId: "",
  username: "",
  nome: "",
  role: "USUARIO",
  permissoes: {
    participantes: "none",
    planejamento: "none",
    checkin: "none",
    retirada: "none",
    eventos: "none",
  },
  isLoggedIn: false,
};

function getSessionPassword(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return "dev-secret-change-in-production-min-32-chars!!";
  }
  return secret;
}

export const sessionOptions: SessionOptions = {
  password: getSessionPassword(),
  cookieName: "retiro-session",
  cookieOptions: {
    // Só usa Secure em HTTPS explícito (HTTP via IP na rede local não envia cookie com Secure)
    secure: getCookieSecure(),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export const EVENTO_COOKIE = "eventoAtivoId";
