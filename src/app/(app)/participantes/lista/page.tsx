import { getAppContext } from "@/lib/app-context";
import ParticipantesList from "@/components/participantes/participantes-list";

export default async function ParticipantesListaPage() {
  const ctx = await getAppContext();
  return <ParticipantesList eventoId={ctx.eventoAtivoId} />;
}
