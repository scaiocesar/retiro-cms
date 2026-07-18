import { getAppContext } from "@/lib/app-context";
import { canEdit } from "@/lib/auth/permissions";
import ParticipantesList from "@/components/participantes/participantes-list";

export default async function ParticipantesListaPage() {
  const ctx = await getAppContext();
  const session = ctx.session!;
  return (
    <ParticipantesList
      eventoId={ctx.eventoAtivoId}
      canEdit={canEdit(session.role, session.permissoes, "participantes")}
    />
  );
}
