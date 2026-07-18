export const MENU_KEYS = [
  "participantes",
  "planejamento",
  "checkin",
  "retirada",
  "eventos",
] as const;

export type MenuKey = (typeof MENU_KEYS)[number];

/** none = sem acesso; read = somente leitura; edit = pode alterar */
export type AccessLevel = "none" | "read" | "edit";

export type UserPermissions = Record<MenuKey, AccessLevel>;

export const MENU_LABELS: Record<MenuKey, string> = {
  participantes: "Participantes",
  planejamento: "Planejamento",
  checkin: "Check-in",
  retirada: "Retirada",
  eventos: "Eventos",
};

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  none: "Sem acesso",
  read: "Somente leitura",
  edit: "Pode editar",
};

/** Default for new USUARIO — operational access with edit (except eventos). */
export const DEFAULT_USUARIO_PERMISSIONS: UserPermissions = {
  participantes: "edit",
  planejamento: "edit",
  checkin: "edit",
  retirada: "edit",
  eventos: "none",
};

export const FULL_PERMISSIONS: UserPermissions = {
  participantes: "edit",
  planejamento: "edit",
  checkin: "edit",
  retirada: "edit",
  eventos: "edit",
};

export function normalizePermissions(
  raw: unknown,
  role?: string
): UserPermissions {
  if (role === "ADMIN") {
    return { ...FULL_PERMISSIONS };
  }

  const base = { ...DEFAULT_USUARIO_PERMISSIONS };
  if (!raw || typeof raw !== "object") {
    return base;
  }

  const input = raw as Partial<Record<string, unknown>>;
  for (const key of MENU_KEYS) {
    const value = input[key];
    if (value === "none" || value === "read" || value === "edit") {
      base[key] = value;
    }
  }
  return base;
}

export function parsePermissionsJson(
  json: string | null | undefined,
  role?: string
): UserPermissions {
  if (role === "ADMIN") return { ...FULL_PERMISSIONS };
  if (!json) return { ...DEFAULT_USUARIO_PERMISSIONS };
  try {
    return normalizePermissions(JSON.parse(json), role);
  } catch {
    return { ...DEFAULT_USUARIO_PERMISSIONS };
  }
}

export function serializePermissions(permissoes: UserPermissions): string {
  return JSON.stringify(permissoes);
}

export function canAccess(
  role: string,
  permissoes: UserPermissions | undefined,
  menu: MenuKey
): boolean {
  if (role === "ADMIN") return true;
  const level = (permissoes ?? DEFAULT_USUARIO_PERMISSIONS)[menu];
  return level === "read" || level === "edit";
}

export function canEdit(
  role: string,
  permissoes: UserPermissions | undefined,
  menu: MenuKey
): boolean {
  if (role === "ADMIN") return true;
  const level = (permissoes ?? DEFAULT_USUARIO_PERMISSIONS)[menu];
  return level === "edit";
}

/** Map app pathname to a menu key. null = always allowed if authenticated. */
export function menuKeyFromPath(pathname: string): MenuKey | "usuarios" | null {
  if (pathname === "/" || pathname === "") return null;
  if (pathname.startsWith("/participantes")) return "participantes";
  if (pathname.startsWith("/planejamento")) return "planejamento";
  if (pathname.startsWith("/checkin")) return "checkin";
  if (pathname.startsWith("/retirada")) return "retirada";
  if (pathname.startsWith("/eventos")) return "eventos";
  if (pathname.startsWith("/usuarios")) return "usuarios";
  if (pathname.startsWith("/relatorios")) return null;
  return null;
}
