import { redirect } from "next/navigation";
import { getAppContext } from "@/lib/app-context";
import NovoParticipanteClient from "@/components/participantes/novo-participante";

export default async function NovoParticipantePage() {
  const ctx = await getAppContext();
  if (!ctx.eventoAtivoId) {
    redirect("/");
  }
  return <NovoParticipanteClient eventoId={ctx.eventoAtivoId} />;
}
