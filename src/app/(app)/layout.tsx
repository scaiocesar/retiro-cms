import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getAppContext } from "@/lib/app-context";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAppContext();

  if (!ctx.session) {
    redirect("/login");
  }

  return (
    <AppShell
      userName={ctx.session.nome}
      userRole={ctx.session.role}
      permissoes={ctx.session.permissoes}
      eventosAtivos={ctx.eventosAtivos}
      eventoAtivo={ctx.eventoAtivo}
      showEventoSelector={ctx.showEventoSelector}
    >
      {children}
    </AppShell>
  );
}
