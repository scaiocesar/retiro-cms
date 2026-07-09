import { getAppContext } from "@/lib/app-context";
import CheckinPageClient from "@/components/checkin/checkin-page";

export default async function CheckinPage() {
  const ctx = await getAppContext();
  return <CheckinPageClient eventoId={ctx.eventoAtivoId} />;
}
