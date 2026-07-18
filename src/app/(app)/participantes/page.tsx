import { getAppContext } from "@/lib/app-context";
import { canEdit } from "@/lib/auth/permissions";
import ParticipantesHub from "@/components/participantes/participantes-hub";

export default async function ParticipantesPage() {
  const ctx = await getAppContext();
  const session = ctx.session!;
  return (
    <ParticipantesHub
      hasEvento={!!ctx.eventoAtivoId}
      canEdit={canEdit(session.role, session.permissoes, "participantes")}
    />
  );
}
