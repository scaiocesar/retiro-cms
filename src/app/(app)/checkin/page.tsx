import { getAppContext } from "@/lib/app-context";
import { canEdit } from "@/lib/auth/permissions";
import CheckinPageClient from "@/components/checkin/checkin-page";

export default async function CheckinPage() {
  const ctx = await getAppContext();
  const session = ctx.session!;
  return (
    <CheckinPageClient
      eventoId={ctx.eventoAtivoId}
      canEdit={canEdit(session.role, session.permissoes, "checkin")}
    />
  );
}
