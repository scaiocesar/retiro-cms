import { getAppContext } from "@/lib/app-context";
import ParticipantesHub from "@/components/participantes/participantes-hub";

export default async function ParticipantesPage() {
  const ctx = await getAppContext();
  return <ParticipantesHub hasEvento={!!ctx.eventoAtivoId} />;
}
