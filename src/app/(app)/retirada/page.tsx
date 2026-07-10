import { getAppContext } from "@/lib/app-context";
import RetiradaPageClient from "@/components/retirada/retirada-page";

export default async function RetiradaPage() {
  const ctx = await getAppContext();
  return <RetiradaPageClient eventoId={ctx.eventoAtivoId} />;
}
