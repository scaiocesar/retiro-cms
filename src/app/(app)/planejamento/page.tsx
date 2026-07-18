import { getAppContext } from "@/lib/app-context";
import { canEdit } from "@/lib/auth/permissions";
import PlanejamentoPageClient from "@/components/planejamento/planejamento-page";

export default async function PlanejamentoPage() {
  const ctx = await getAppContext();
  const session = ctx.session!;
  return (
    <PlanejamentoPageClient
      eventoId={ctx.eventoAtivoId}
      canEdit={canEdit(session.role, session.permissoes, "planejamento")}
    />
  );
}
