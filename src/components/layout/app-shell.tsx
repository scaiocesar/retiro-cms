"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  CalendarClock,
  ClipboardCheck,
  Home,
  LogOut,
  Shirt,
  Users,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  canAccess,
  menuKeyFromPath,
  type MenuKey,
  type UserPermissions,
} from "@/lib/auth/permissions";
import type { Evento, UserRole } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof Home;
  menu: MenuKey | null;
  adminOnly?: boolean;
}> = [
  { href: "/", label: "Início", icon: Home, menu: null },
  { href: "/participantes", label: "Participantes", icon: Users, menu: "participantes" },
  { href: "/planejamento", label: "Planejamento", icon: CalendarClock, menu: "planejamento" },
  { href: "/checkin", label: "Check-in", icon: ClipboardCheck, menu: "checkin" },
  { href: "/retirada", label: "Retirada", icon: Shirt, menu: "retirada" },
  { href: "/eventos", label: "Eventos", icon: Calendar, menu: "eventos" },
  { href: "/usuarios", label: "Usuários", icon: UserCog, menu: null, adminOnly: true },
];

export function AppShell({
  children,
  userName,
  userRole,
  permissoes,
  eventosAtivos,
  eventoAtivo,
  showEventoSelector,
}: {
  children: React.ReactNode;
  userName: string;
  userRole: UserRole;
  permissoes: UserPermissions;
  eventosAtivos: Evento[];
  eventoAtivo: Evento | null;
  showEventoSelector: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const allNav = navItems.filter((item) => {
    if (item.adminOnly) return userRole === "ADMIN";
    if (!item.menu) return true;
    return canAccess(userRole, permissoes, item.menu);
  });

  useEffect(() => {
    const menu = menuKeyFromPath(pathname);
    if (menu === "usuarios" && userRole !== "ADMIN") {
      router.replace("/");
      return;
    }
    if (menu && menu !== "usuarios" && !canAccess(userRole, permissoes, menu)) {
      router.replace("/");
    }
  }, [pathname, userRole, permissoes, router]);

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
        toast.error("Erro ao sair");
        return;
      }
      toast.success("Até logo!");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Erro de conexão");
    }
  }

  async function handleEventoChange(eventoId: string) {
    await fetch("/api/eventos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventoId }),
    });
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border p-6">
          <h1 className="text-lg font-bold text-primary">Retiro CMS</h1>
          <p className="text-sm text-muted-foreground">{userName}</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {allNav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0 flex-1">
              {showEventoSelector ? (
                <Select
                  value={eventoAtivo?.id ?? ""}
                  onValueChange={handleEventoChange}
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Selecione o retiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventosAtivos.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nome} — {formatDate(e.data)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : eventoAtivo ? (
                <div>
                  <p className="font-medium truncate">{eventoAtivo.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(eventoAtivo.data)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum retiro ativo
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 pb-24 md:p-6">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card md:hidden">
          {allNav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
