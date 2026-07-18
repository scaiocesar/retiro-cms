import { getAppContext } from "@/lib/app-context";
import PlanejamentoPageClient from "@/components/planejamento/planejamento-page";

export default async function PlanejamentoPage() {
  const ctx = await getAppContext();
  return <PlanejamentoPageClient eventoId={ctx.eventoAtivoId} />;
}
