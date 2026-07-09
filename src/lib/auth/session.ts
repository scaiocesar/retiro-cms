import type { SessionOptions } from "iron-session";
import { getCookieSecure } from "@/lib/auth/cookie-options";
import type { UserRole } from "@/lib/types";

export interface SessionData {
  userId: string;
  email: string;
  nome: string;
  role: UserRole;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  userId: "",
  email: "",
  nome: "",
  role: "USUARIO",
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
