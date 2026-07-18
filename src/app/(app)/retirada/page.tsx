import { getAppContext } from "@/lib/app-context";
import { canEdit } from "@/lib/auth/permissions";
import RetiradaPageClient from "@/components/retirada/retirada-page";

export default async function RetiradaPage() {
  const ctx = await getAppContext();
  const session = ctx.session!;
  return (
    <RetiradaPageClient
      eventoId={ctx.eventoAtivoId}
      canEdit={canEdit(session.role, session.permissoes, "retirada")}
    />
  );
}
