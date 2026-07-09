import { getAppContext } from "@/lib/app-context";
import ParticipanteDetailClient from "@/components/participantes/participante-detail";

type PageProps = { params: Promise<{ id: string }> };

export default async function ParticipanteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ctx = await getAppContext();
  const isAdmin = ctx.session?.role === "ADMIN";

  return (
    <ParticipanteDetailClient
      id={id}
      isAdmin={isAdmin}
      eventoId={ctx.eventoAtivoId ?? ""}
    />
  );
}
