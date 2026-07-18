import { getAppContext } from "@/lib/app-context";
import { canEdit } from "@/lib/auth/permissions";
import ParticipanteDetailClient from "@/components/participantes/participante-detail";

type PageProps = { params: Promise<{ id: string }> };

export default async function ParticipanteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ctx = await getAppContext();
  const session = ctx.session!;
  const canEditParticipante = canEdit(
    session.role,
    session.permissoes,
    "participantes"
  );

  return (
    <ParticipanteDetailClient
      id={id}
      isAdmin={canEditParticipante}
      eventoId={ctx.eventoAtivoId ?? ""}
    />
  );
}
