import { getAppContext } from "@/lib/app-context";
import { canEdit } from "@/lib/auth/permissions";
import EventosPageClient from "@/components/eventos/eventos-page";

export default async function EventosPage() {
  const ctx = await getAppContext();
  const session = ctx.session!;
  return (
    <EventosPageClient
      canEdit={canEdit(session.role, session.permissoes, "eventos")}
    />
  );
}
