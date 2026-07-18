import { redirect } from "next/navigation";
import { getAppContext } from "@/lib/app-context";
import { canEdit } from "@/lib/auth/permissions";
import NovoParticipanteClient from "@/components/participantes/novo-participante";

export default async function NovoParticipantePage() {
  const ctx = await getAppContext();
  if (!ctx.eventoAtivoId) {
    redirect("/");
  }
  const session = ctx.session!;
  if (!canEdit(session.role, session.permissoes, "participantes")) {
    redirect("/participantes");
  }
  return <NovoParticipanteClient eventoId={ctx.eventoAtivoId} />;
}
